"""Saint-Rémy 인스타 릴스 발사기.

캐러셀(publish_carousel.py)과 달리 영상은 공개 URL이 필요 없다.
Graph API의 resumable upload를 쓰면 파일 바이트를 직접 올린다 —
Cloudflare Pages는 파일당 25MiB 제한이라 100MB짜리 릴스를 호스팅할 수 없기 때문에
이 방식이 유일한 길이다.

커버 이미지만 공개 URL이 필요하다(수백 KB라 Pages에 올라간다).

환경변수:
  META_ACCESS_TOKEN        Meta 장기 액세스 토큰
  IG_BUSINESS_ACCOUNT_ID   Instagram 비즈니스 계정 ID (17841...)

사용:
  set -a && source .env && set +a
  python3 publish_reel.py /path/to/reel.mp4 \\
      --caption "..." \\
      --cover-url https://saintremy.kr/images/instagram/<slug>/cover.jpg
"""
import argparse
import os
import pathlib
import sys
import time

import requests

VER = "v22.0"
GRAPH = f"https://graph.facebook.com/{VER}"
RUPLOAD = f"https://rupload.facebook.com/ig-api-upload/{VER}"


def create_container(token, ig_id, caption, cover_url, share_to_feed):
    data = {
        "media_type": "REELS",
        "upload_type": "resumable",
        "caption": caption,
        "share_to_feed": "true" if share_to_feed else "false",
        "access_token": token,
    }
    if cover_url:
        data["cover_url"] = cover_url
    r = requests.post(f"{GRAPH}/{ig_id}/media", data=data, timeout=90)
    if not r.ok:
        print(f"❌ 컨테이너 생성 실패: {r.status_code} {r.text[:400]}", file=sys.stderr)
        r.raise_for_status()
    return r.json()["id"]


def upload_bytes(token, container_id, path: pathlib.Path, tries=1):
    """rupload 엔드포인트에 파일을 통째로 올린다. offset=0부터 한 번에.

    ★재시도 금지 — 같은 컨테이너에 두 번 올리면 "Request processing failed"가 뜨고
    진짜 원인(트랜스코딩 에러)이 가려진다. 실패하면 컨테이너를 새로 만들어야 한다.
    """
    size = path.stat().st_size
    # ★바이트를 통째로 읽어서 넘긴다. 파일 객체를 주면 requests가 chunked 전송을 쓰고
    #   Content-Length 가 빠져서 rupload 가 "Request processing failed" 로 거절한다.
    blob = path.read_bytes()
    headers = {
        "Authorization": f"OAuth {token}",
        "offset": "0",
        "file_size": str(size),
        "Content-Type": "application/octet-stream",
        "Content-Length": str(size),
    }
    last = None
    for attempt in range(1, tries + 1):
        r = requests.post(f"{RUPLOAD}/{container_id}", headers=headers,
                          data=blob, timeout=900)
        if r.ok and r.json().get("success"):
            return True
        last = r
        print(f"  ! 업로드 시도 {attempt}: {r.status_code}\n{r.text[:2000]}", file=sys.stderr)
        time.sleep(6 * attempt)
    last.raise_for_status()
    return False


def wait_for_status(token, container_id, timeout_s=900):
    """릴스는 트랜스코딩이 걸려서 캐러셀보다 오래 기다려야 한다."""
    deadline = time.time() + timeout_s
    last = ""
    while time.time() < deadline:
        r = requests.get(f"{GRAPH}/{container_id}",
                         params={"fields": "status_code,status", "access_token": token},
                         timeout=20)
        j = r.json()
        code = j.get("status_code", "")
        if code != last:
            print(f"  status: {code}")
            last = code
        if code == "FINISHED":
            return True
        if code == "ERROR":
            print(f"❌ 처리 실패: {j}", file=sys.stderr)
            return False
        time.sleep(6)
    print("⚠️ FINISHED 대기 타임아웃", file=sys.stderr)
    return False


def publish(token, ig_id, container_id):
    r = requests.post(f"{GRAPH}/{ig_id}/media_publish",
                      data={"creation_id": container_id, "access_token": token},
                      timeout=90)
    if not r.ok:
        print(f"❌ 발행 실패: {r.status_code} {r.text[:400]}", file=sys.stderr)
        r.raise_for_status()
    return r.json()["id"]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("video", help="릴스 mp4 경로")
    p.add_argument("--caption", required=True)
    p.add_argument("--cover-url", default="", help="공개 커버 이미지 URL (9:16 권장)")
    p.add_argument("--no-feed", action="store_true", help="피드에 안 걸고 릴스 탭에만")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    path = pathlib.Path(args.video)
    if not path.exists():
        print(f"❌ 영상 없음: {path}", file=sys.stderr)
        sys.exit(3)
    size_mb = path.stat().st_size / 1024 / 1024

    if args.dry_run:
        print(f"[DRY RUN] {path.name} · {size_mb:.1f}MB")
        print(f"cover_url: {args.cover_url or '(없음 — IG가 첫 프레임을 씀)'}")
        print(f"\nCAPTION:\n{args.caption}")
        return

    token = os.environ.get("META_ACCESS_TOKEN", "")
    ig_id = os.environ.get("IG_BUSINESS_ACCOUNT_ID", "")
    if not token or not ig_id:
        print("❌ META_ACCESS_TOKEN / IG_BUSINESS_ACCOUNT_ID 비어 있음", file=sys.stderr)
        sys.exit(1)

    print(f"🎬 {path.name} · {size_mb:.1f}MB")
    print("📦 릴스 컨테이너 생성 중...")
    cid = create_container(token, ig_id, args.caption, args.cover_url, not args.no_feed)
    print(f"  → {cid}")

    print("📤 영상 업로드 중... (100MB면 몇 분 걸린다)")
    upload_bytes(token, cid, path)
    print("  ✓ 업로드 완료")

    print("⏳ 트랜스코딩 대기...")
    if not wait_for_status(token, cid):
        sys.exit(2)

    print("🚀 발사")
    post_id = publish(token, ig_id, cid)
    print(f"✅ 게시 완료 — Post ID: {post_id}")
    print(f"   https://www.instagram.com/reel/{post_id}/")


if __name__ == "__main__":
    main()
