#!/bin/bash
# 조코비치 RITUAL N°003 자동 발사 — 2026-05-25 07:00 KST
# 사전 점검 (디스크·좀비·lock) + cp + build + push + IG 발사 + 자기 cron 제거

set -e
SLUG=djokovic-ritual-7
REPO=~/Desktop/saintremy
LOG=$REPO/tools/instagram/$SLUG/launch.log

exec > >(tee -a "$LOG") 2>&1
echo "=== $(date) — Djokovic 발사 시작 ==="

# 사전 점검
AVAIL_GB=$(df -g "$REPO" | tail -1 | awk '{print $4}')
echo "디스크 여유: ${AVAIL_GB}Gi"
if [ "$AVAIL_GB" -lt 5 ]; then
    echo "❌ 디스크 5Gi 미만 — abort"; exit 1
fi

ZOMBIES=$(ps aux | grep -E 'ugrep|build-content|git commit' | grep -v grep | wc -l)
echo "좀비 프로세스: $ZOMBIES"
if [ "$ZOMBIES" -gt 0 ]; then
    echo "⚠️ 좀비 발견 — 강제 종료" && pkill -9 -f 'ugrep' ; pkill -9 -f 'build-content' ; pkill -9 -f 'git commit'
fi

rm -f $REPO/.git/index.lock $REPO/.git/HEAD.lock 2>/dev/null

cd "$REPO"

# 1. 카드 public 복사
mkdir -p public/images/instagram/$SLUG
cp -f tools/instagram/$SLUG/*.jpg public/images/instagram/$SLUG/
echo "✅ 카드 복사: $(ls public/images/instagram/$SLUG/ | wc -l)장"

# 2. git push (articles.json은 Cloudflare가 재생성)
git add content/articles/story/ritual-djokovic.md \
        public/images/articles/ritual-djokovic/ \
        public/images/instagram/$SLUG/ \
        scripts/automation/configs/instagram/$SLUG.json \
        scripts/automation/instagram/launch_djokovic.sh
git commit -m "ritual N°003 — 조코비치 글루텐 프리

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push origin main
echo "✅ git push 완료"

# 3. Cloudflare 배포 대기
echo "⏳ Cloudflare 배포 대기 120초..."
sleep 120

# 4. 카드 호스팅 확인
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "https://saintremy.kr/images/instagram/$SLUG/01-hook.jpg")
echo "카드 호스팅: HTTP $HTTP"

# 5. 인스타 발사
set -a; source .env; set +a
python3 scripts/automation/instagram/publish_carousel.py $SLUG --caption "$(cat <<'CAP'
테니스 역대 1위가 매일 안 먹는 3가지 음식.
글루텐·유제품·정제 설탕 — 14년의 식단.

saintremy.kr

#saintremykr #조코비치 #식단
CAP
)"

echo "=== $(date) — 발사 완료 ==="

# 6. 자기 cron 제거 (1회성)
(crontab -l 2>/dev/null | grep -v 'launch_djokovic.sh') | crontab - 2>/dev/null
echo "✅ cron 자기 제거"
