#!/bin/bash
# Saint-Rémy PROTOCOL N°012 — moxa-2026-7 발행 스크립트
set -euo pipefail

SR="$HOME/Desktop/saintremy"
SLUG="moxa-2026-7"

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
  "scripts/publish_moxa.sh" \
  "tools/instagram/$SLUG/"
git commit -m "feat: PROTOCOL N°012 — 쑥뜸·효소찜질 (Cochrane 2023/2018 · 검색량 3배)"
git push origin main

echo "▶ Cloudflare 배포 대기..."
FILES=(01-hook 02-essay 03-essay 04-essay 05-essay 06-essay 07-closing)
for f in "${FILES[@]}"; do
  echo -n "  $f: "
  for i in $(seq 1 40); do
    CT=$(curl -sI "https://saintremy.kr/images/instagram/$SLUG/$f.jpg" | grep -i 'content-type' | tr -d '\r' || true)
    if [[ "$CT" == *"image/jpeg"* ]]; then
      echo "OK"; break
    fi
    sleep 15
  done
done
echo "  엣지 전파 여유 30초..."
sleep 30

echo "▶ Instagram 발사..."
python3 scripts/automation/instagram/publish_carousel.py "$SLUG" --caption "$(cat <<'CAP'
요즘 MZ세대는 쑥뜸을 하러 간다.

네이버 '쑥뜸' 검색량이 지난해 7월 약 7천 건에서 올해 2월 3만 건으로, 여섯 달 만에 세 배가 됐습니다. '찜질방'도 같은 기간 17만에서 36만으로 늘었고, 신한카드 분석에서는 쑥뜸 가맹점 결제 건수 중 2030 비중이 13.3%에서 40.7%로 올랐습니다.

그래서 효과는 있을까요. 근거가 확인된 건 하나입니다. 뱃속 아기가 거꾸로 있을 때 자세를 돌리는 것으로, 13개 연구 2,181명을 모아 다시 계산한 2023년 분석에서 확인됐습니다. 다만 같은 분석에서 제왕절개를 하게 될 확률은 거의 달라지지 않았습니다.

반대로 가장 많이 말해지는 효능들은 근거가 없습니다. 수족냉증은 논문이 한 건도 없고, 난임은 결과를 낸 연구가 없습니다. 항암 부작용은 29개 연구 2,569명을 모아도 '이득이 있는지 해가 있는지 알 수 없다'가 결론이었습니다.

지난해에는 무면허 시술자에게 16번 쑥뜸을 받은 손님이 양쪽 정강이에 3도 화상을 입고 피부이식 수술을 받은 판결도 있었습니다.

따뜻하면 편안합니다. 다만 편안한 것과 낫는 것은 다른 말입니다.

saintremy.kr — PROTOCOL N°012

#saintremykr #쑥뜸 #효소찜질 #웰니스 #저속노화
CAP
)"

echo "✅ 완료"
