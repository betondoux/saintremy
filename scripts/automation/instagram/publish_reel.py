"""Saint-Rémy 인스타 릴스 발사기.

★영상은 공개 URL(video_url)로 넘긴다.

  resumable upload(rupload.facebook.com)는 2026-08-27에 시도했다가 전부 실패했다.
  컨테이너는 만들어지는데 rupload가 "Request processing failed"만 뱉고, 컨테이너는
  IN_PROGRESS로 10분 넘게 멈춘다. requests·curl 둘 다 같은 결과.
  원인 = 우리 토큰이 PAGE 타입(Facebook 페이지 경유 Instagram Graph API)이라
  resumable 경로를 못 쓴다. 그건 Instagram Login 계열 토큰 전용이다.

  그래서 영상을 saintremy.kr에 올려서 URL로 넘긴다.
  ★Cloudflare Pages는 파일당 25MiB 제한 — 반드시 그 아래로 인코딩해야 한다.
    2분짜리 9:16이면 720×1280 · 2-pass 1500k + 오디오 96k = 약 22.5MiB.

★발행이 끝나면 public/videos/<slug>.mp4 를 지운다.

  인스타가 트랜스코딩하면서 자기 서버로 복사해 가므로 원본 URL은 더 필요 없다.
  안 지우면 릴스를 올릴 때마다 저장소가 20MB씩 무거워진다.

    git rm -f public/videos/<slug>.mp4 && git commit && git push

  커버 이미지(public/images/instagram/<slug>/cover.jpg)는 몇백 KB라 남겨둔다.

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
import sys
import time

import requests

VER = "v22.0"
GRAPH = f"https://graph.facebook.com/{VER}"
RUPLOAD = f"https://rupload.facebook.com/ig-api-upload/{VER}"


def create_container(token, ig_id, video_url, caption, cover_url, share_to_feed):
    data = {
        "media_type": "REELS",
        "video_url": video_url,
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
    p.add_argument("video_url", help="공개 영상 URL (saintremy.kr/videos/...)")
    p.add_argument("--caption", required=True)
    p.add_argument("--cover-url", default="", help="공개 커버 이미지 URL (9:16 권장)")
    p.add_argument("--no-feed", action="store_true", help="피드에 안 걸고 릴스 탭에만")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    if args.dry_run:
        print(f"[DRY RUN] video_url: {args.video_url}")
        print(f"cover_url: {args.cover_url or '(없음 — IG가 첫 프레임을 씀)'}")
        print(f"\nCAPTION:\n{args.caption}")
        return

    token = os.environ.get("META_ACCESS_TOKEN", "")
    ig_id = os.environ.get("IG_BUSINESS_ACCOUNT_ID", "")
    if not token or not ig_id:
        print("❌ META_ACCESS_TOKEN / IG_BUSINESS_ACCOUNT_ID 비어 있음", file=sys.stderr)
        sys.exit(1)

    print(f"🎬 {args.video_url}")
    print("📦 릴스 컨테이너 생성 중...")
    cid = create_container(token, ig_id, args.video_url, args.caption,
                           args.cover_url, not args.no_feed)
    print(f"  → {cid}")

    print("⏳ 트랜스코딩 대기...")
    if not wait_for_status(token, cid):
        sys.exit(2)

    print("🚀 발사")
    post_id = publish(token, ig_id, cid)
    print(f"✅ 게시 완료 — Post ID: {post_id}")
    print(f"   https://www.instagram.com/reel/{post_id}/")


if __name__ == "__main__":
    main()
