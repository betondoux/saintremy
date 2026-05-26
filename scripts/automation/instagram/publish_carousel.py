"""Saint-Rémy 인스타 캐러셀 발사기 (imgbb 우회).

카드 9장이 이미 saintremy.kr에 호스팅되어 있다고 가정하고,
IG Graph API에 image_url로 직접 넘긴다 — imgbb 거치지 않음, 비용 0원.

환경변수:
  META_ACCESS_TOKEN        Meta 장기 액세스 토큰 (60일 만료)
  IG_BUSINESS_ACCOUNT_ID   Instagram 비즈니스 계정 ID (17841...)

사용:
  export META_ACCESS_TOKEN="EAAxxx..."
  export IG_BUSINESS_ACCOUNT_ID="17841xxx"

  python3 publish_carousel.py jungsik-3-stars-9 \\
    --caption "10분짜리 메모, 15년 뒤의 세 번째 별
  임정식 셰프, 정식당 — 한국 셰프가 가장 많은 별을 따낸 30년의 기록.

  saintremy.kr"

  # 또는 dry-run (image_url만 출력하고 발사 X)
  python3 publish_carousel.py jungsik-3-stars-9 --caption "..." --dry-run
"""
import argparse
import os
import sys
import time
import pathlib
import requests

GRAPH = "https://graph.facebook.com/v22.0"
BASE = "https://saintremy.kr/images/instagram"
LOCAL_BASE = pathlib.Path("/Users/kimsucheol/Desktop/saintremy/public/images/instagram")


def discover_cards(slug: str):
    """로컬 디렉토리에서 jpg 파일을 정렬해서 가져옴 (슬라이드 타입 무관)."""
    local_dir = LOCAL_BASE / slug
    if not local_dir.exists():
        return []
    return sorted([f.name for f in local_dir.glob("*.jpg")])


def create_child(token, ig_id, image_url):
    r = requests.post(
        f"{GRAPH}/{ig_id}/media",
        data={
            "image_url": image_url,
            "is_carousel_item": "true",
            "access_token": token,
        },
        timeout=90,
    )
    r.raise_for_status()
    return r.json()["id"]


def create_carousel(token, ig_id, children_ids, caption):
    r = requests.post(
        f"{GRAPH}/{ig_id}/media",
        data={
            "media_type": "CAROUSEL",
            "children": ",".join(children_ids),
            "caption": caption,
            "access_token": token,
        },
        timeout=90,
    )
    r.raise_for_status()
    return r.json()["id"]


def wait_for_status(token, container_id, timeout_s=120):
    """캐러셀 컨테이너가 FINISHED 될 때까지 대기."""
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        r = requests.get(
            f"{GRAPH}/{container_id}",
            params={"fields": "status_code", "access_token": token},
            timeout=15,
        )
        status = r.json().get("status_code", "")
        if status == "FINISHED":
            return True
        if status == "ERROR":
            print(f"❌ 컨테이너 처리 실패: {r.json()}", file=sys.stderr)
            return False
        time.sleep(3)
    print("⚠️ status FINISHED 대기 타임아웃 — 그래도 publish 시도", file=sys.stderr)
    return True


def publish(token, ig_id, container_id):
    r = requests.post(
        f"{GRAPH}/{ig_id}/media_publish",
        data={"creation_id": container_id, "access_token": token},
        timeout=90,
    )
    r.raise_for_status()
    return r.json()["id"]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("slug", help="예: jungsik-3-stars-9")
    p.add_argument("--caption", required=True)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    token = os.environ.get("META_ACCESS_TOKEN", "")
    ig_id = os.environ.get("IG_BUSINESS_ACCOUNT_ID", "")

    card_files = discover_cards(args.slug)
    if not card_files:
        print(f"❌ 로컬 디렉토리에 jpg 없음: {LOCAL_BASE / args.slug}", file=sys.stderr)
        sys.exit(3)
    # Cache-bust query — Cloudflare 캐시된 이미지를 IG fetcher 가 거부하는 경우 우회
    import time as _t
    cb = int(_t.time())
    image_urls = [f"{BASE}/{args.slug}/{f}?v={cb}" for f in card_files]

    if args.dry_run:
        print("[DRY RUN] 발사 안 함. 사용될 image_url:")
        for u in image_urls:
            print(" -", u)
        print(f"\nCAPTION:\n{args.caption}")
        return

    if not token or not ig_id:
        print("❌ META_ACCESS_TOKEN / IG_BUSINESS_ACCOUNT_ID 환경변수 비어 있어.", file=sys.stderr)
        sys.exit(1)

    print(f"📸 슬러그: {args.slug}")
    print("📤 9장 미디어 컨테이너 생성 중...")
    children = []
    for i, url in enumerate(image_urls, 1):
        cid = create_child(token, ig_id, url)
        print(f"  {i:02d}/09  {cid}")
        children.append(cid)

    print("🧵 캐러셀 컨테이너 생성 중...")
    carousel_id = create_carousel(token, ig_id, children, args.caption)
    print(f"  → {carousel_id}")

    print("⏳ 처리 대기...")
    if not wait_for_status(token, carousel_id):
        print("❌ 처리 실패", file=sys.stderr)
        sys.exit(2)

    print("🚀 발사")
    post_id = publish(token, ig_id, carousel_id)
    print(f"✅ 게시 완료 — Post ID: {post_id}")
    print(f"   https://www.instagram.com/p/{post_id}/")


if __name__ == "__main__":
    main()
