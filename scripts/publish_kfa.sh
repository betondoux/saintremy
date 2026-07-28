#!/bin/bash
# Saint-Rémy AGAINST N°003 — kfa-card-2026-7 발행 스크립트
set -euo pipefail

SR="$HOME/Desktop/saintremy"
SLUG="kfa-card-2026-7"

cd "$SR"

set -a; source .env; set +a
echo "▶ 토큰 확인..."
TOKEN_CHECK=$(curl -sS "https://graph.facebook.com/v22.0/me?access_token=$META_ACCESS_TOKEN")
if [[ "$TOKEN_CHECK" == *"error"* ]]; then
  echo "❌ 토큰 만료. 응답: $TOKEN_CHECK"
  exit 1
fi
echo "  OK: $TOKEN_CHECK"

echo "▶ public 복사..."
mkdir -p "public/images/instagram/$SLUG"
cp tools/instagram/$SLUG/*.jpg "public/images/instagram/$SLUG/"

echo "▶ git..."
rm -f .git/index.lock
git add \
  "public/images/instagram/$SLUG/" \
  "public/images/articles/$SLUG/" \
  "scripts/automation/configs/instagram/$SLUG.json" \
  "scripts/publish_kfa.sh" \
  "tools/instagram/$SLUG/"
git commit -m "feat: AGAINST N°003 — 축구협회 법인카드 (JTBC 단독 보도 인용)"
git push origin main

echo "▶ Cloudflare 배포 대기..."
FILES=(01-hook 02-essay 03-essay 04-essay 05-essay 06-closing)
for f in "${FILES[@]}"; do
  echo -n "  $f: "
  for i in $(seq 1 40); do
    CT=$(curl -sI "https://saintremy.kr/images/instagram/$SLUG/$f.jpg" | grep -i 'content-type' | tr -d '\r' || true)
    if [[ "$CT" == *"image/jpeg"* ]]; then
      echo "OK"
      break
    fi
    sleep 15
  done
done

echo "▶ Instagram 발사..."
python3 scripts/automation/instagram/publish_carousel.py "$SLUG" --caption "$(cat <<'CAP'
홍명보 집 근처 한우집, 중국집. 법인카드 1,400만 원.

대한축구협회 법인카드 2년 치 사용 내역이 JTBC 단독 보도로 공개됐습니다. 2024년 7월부터 올해 5월까지 홍명보 전 감독이 쓴 3,742만 원 가운데 약 37%가 자택 인근에서 결제됐습니다. 공휴일 결제도 375만 원어치였습니다.

협회는 "회계팀이 매달 점검해 문제가 없다고 판단했다"고 설명했습니다. 다만 규정상 필요한 소명서는 한 건도 받지 않았다고 인정했습니다.

감독만의 문제가 아닙니다. 최영일 전 부회장은 잠실 일식집에서 4년간 1,161만 원을 썼고, 2024년 2월 그 식당 주인과 결혼했습니다. 결혼한 뒤에도 결제가 이어졌습니다. 벨기에 항공사에 1억 1,719만 원, 유아복 업체에 330만 원을 결제한 내역도 함께 공개됐습니다.

축구협회는 나랏돈으로 운영됩니다. 홍명보 전 감독과 정몽규 전 회장은 30일 국회 청문회에 증인으로 나옵니다.

saintremy.kr — AGAINST N°003

#saintremykr #대한축구협회 #홍명보 #법인카드 #국회청문회
CAP
)"

echo "✅ 완료"
