"""Saint-Rémy 인스타 릴스 발사기.

영상(.mp4)과 커버(.jpg)가 saintremy.kr/reels/<slug>/ 에 호스팅돼 있다고 가정하고,
IG Graph API에 media_type=REELS 로 video_url + cover_url 을 넘긴다.

릴스는 캐러셀과 달리 비동기 인코딩이 필요 → status_code FINISHED 까지 폴링 후 publish.

환경변수:
  META_ACCESS_TOKEN        Meta 장기 액세스 토큰 (60일 만료)
  IG_BUSINESS_ACCOUNT_ID   Instagram 비즈니스 계정 ID (17841...)

사용:
  python3 publish_reel.py protocol-sleep-longevity --caption "..."
  python3 publish_reel.py protocol-sleep-longevity --caption "..." --dry-run
"""
import argparse
import os
import sys
import time
import requests

GRAPH = "https://graph.facebook.com/v22.0"
BASE = "https://saintremy.kr/reels"


def create_reel(token, ig_id, video_url, cover_url, caption):
    r = requests.post(
        f"{GRAPH}/{ig_id}/media",
        data={
            "media_type": "REELS",
            "video_url": video_url,
            "cover_url": cover_url,
            "caption": caption,
            "share_to_feed": "true",
            "access_token": token,
        },
        timeout=120,
    )
    if not r.ok:
        print(f"❌ 컨테이너 생성 실패: {r.status_code} {r.text}", file=sys.stderr)
    r.raise_for_status()
    return r.json()["id"]


def wait_for_status(token, container_id, timeout_s=300):
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        r = requests.get(
            f"{GRAPH}/{container_id}",
            params={"fields": "status_code,status", "access_token": token},
            timeout=15,
        )
        j = r.json()
        status = j.get("status_code", "")
        print(f"   status={status}  ({j.get('status','')})")
        if status == "FINISHED":
            return True
        if status == "ERROR":
            print(f"❌ 컨테이너 처리 실패: {j}", file=sys.stderr)
            return False
        time.sleep(5)
    print("⚠️ FINISHED 대기 타임아웃", file=sys.stderr)
    return False


def publish(token, ig_id, container_id):
    r = requests.post(
        f"{GRAPH}/{ig_id}/media_publish",
        data={"creation_id": container_id, "access_token": token},
        timeout=120,
    )
    if not r.ok:
        print(f"❌ 발행 실패: {r.status_code} {r.text}", file=sys.stderr)
    r.raise_for_status()
    return r.json()["id"]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("slug", help="예: protocol-sleep-longevity")
    p.add_argument("--caption", required=True)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    token = os.environ.get("META_ACCESS_TOKEN", "")
    ig_id = os.environ.get("IG_BUSINESS_ACCOUNT_ID", "")

    cb = int(time.time())
    video_url = f"{BASE}/{args.slug}/sleep_short.mp4?v={cb}"
    cover_url = f"{BASE}/{args.slug}/cover.jpg?v={cb}"

    if args.dry_run:
        print("[DRY RUN] 발사 안 함.")
        print(" video_url:", video_url)
        print(" cover_url:", cover_url)
        print(f"\nCAPTION:\n{args.caption}")
        return

    if not token or not ig_id:
        print("❌ META_ACCESS_TOKEN / IG_BUSINESS_ACCOUNT_ID 비어 있음.", file=sys.stderr)
        sys.exit(1)

    print(f"🎬 슬러그: {args.slug}")
    print(f"📤 릴스 컨테이너 생성 중...\n   video={video_url}\n   cover={cover_url}")
    cid = create_reel(token, ig_id, video_url, cover_url, args.caption)
    print(f"  → {cid}")

    print("⏳ 인코딩 처리 대기...")
    if not wait_for_status(token, cid):
        print("❌ 처리 실패", file=sys.stderr)
        sys.exit(2)

    print("🚀 발사")
    post_id = publish(token, ig_id, cid)
    print(f"✅ 게시 완료 — Media ID: {post_id}")


if __name__ == "__main__":
    main()
