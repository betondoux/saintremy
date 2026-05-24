#!/bin/bash
# 톰 브래디 RITUAL N°002 자동 발사 — 11:00 KST 예약
# 1) 카드 public 복사 → 2) build:content → 3) git push → 4) 사이트 대기 → 5) 인스타 발사
# 실행 후 자기 LaunchAgent 삭제 (1회성)

set -e
LOG=~/Desktop/saintremy/tools/instagram/brady-ritual-7/launch.log
SLUG=brady-ritual-7
REPO=~/Desktop/saintremy

exec > >(tee -a "$LOG") 2>&1
echo "=== $(date) — Brady 발사 시작 ==="

cd "$REPO"

# 1. 카드 public 복사
mkdir -p public/images/instagram/$SLUG
cp -f tools/instagram/$SLUG/*.jpg public/images/instagram/$SLUG/
echo "✅ 카드 복사: $(ls public/images/instagram/$SLUG/ | wc -l)장"

# 2. articles.json 재생성
npm run build:content 2>&1 | tail -5

# 3. git push
git add content/articles/story/ritual-brady.md \
        public/images/articles/ritual-brady/ \
        public/images/instagram/$SLUG/ \
        scripts/automation/configs/instagram/$SLUG.json \
        src/generated/articles.json
git commit -m "ritual N°002 — 톰 브래디 TB12 식단

Saint-Rémy Ritual 두 번째 인물. 45세까지 NFL 슈퍼볼 7회 우승한
톰 브래디의 TB12 식단 — 알칼리 80, 나이트셰이드 0, Alex Guerrero 20년.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push origin main
echo "✅ git push 완료"

# 4. Cloudflare 배포 대기 (90초)
echo "⏳ Cloudflare 배포 대기 90초..."
sleep 90

# 5. 카드 호스팅 확인
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "https://saintremy.kr/images/instagram/$SLUG/01-hook.jpg")
echo "카드 호스팅: HTTP $HTTP"

# 6. 인스타 발사
set -a; source .env; set +a
python3 scripts/automation/instagram/publish_carousel.py $SLUG --caption "$(cat <<'CAP'
45세까지 NFL을 뛴 그가 평생 안 먹은 음식 4가지.
TB12 메서드 — 알칼리 80, 나이트셰이드 0.

saintremy.kr

#saintremykr #톰브래디 #식단
CAP
)"

echo "=== $(date) — 발사 완료 ==="

# 7. 자기 LaunchAgent 삭제 (1회성)
PLIST=~/Library/LaunchAgents/kr.saintremy.brady.launch.plist
launchctl unload "$PLIST" 2>/dev/null || true
rm -f "$PLIST"
echo "✅ LaunchAgent 자기 삭제 완료"
