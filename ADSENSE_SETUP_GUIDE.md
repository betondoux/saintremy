# 🎯 AMATOR × Google AdSense 설정 가이드

AdSense **광고 자리는 이미 준비되어 있습니다**. 승인받은 뒤 환경변수만 설정하면 즉시 활성화됩니다.

---

## 📅 타이밍 — 언제 AdSense 신청할까?

### 권장 시점 (성공률 극대화):

```
✅ amator.kr 도메인이 사이트에 연결된 후
✅ 기사가 최소 10편 이상 쌓인 후
✅ 사이트가 최소 1개월 이상 라이브 상태
✅ 개인정보 처리방침 + 이용약관 페이지 추가 후
✅ 월 방문자 1,000+ 달성 후 (이상적)
```

### 지금 신청하면?
- 콘텐츠 5편 + 서브도메인 = **거절 가능성 높음**
- 한 번 거절당하면 최소 1개월 대기 후 재신청
- 여러 번 거절되면 영구 블랙리스트

**결론: 기반 먼저, 광고 나중에.** 1-2개월 안에 신청.

---

## 🔧 광고 자리 (이미 설정됨)

현재 광고가 표시될 수 있는 위치:

### 홈페이지 (3곳):
1. **`hero-to-sections`** — 히어로 아래, 종목 섹션 위
2. **`articles-to-shop`** — 4종목 섹션 아래, SHOP 위 (Strategist 스타일 ⭐)
3. **`latest-to-newsletter`** — MORE LATEST 아래, NEWSLETTER 위

### 기사 상세 페이지 (1곳):
4. **`article-body-end`** — 본문 끝 직후, 출처 목록 위

각 자리는 **전체 너비 가로 배너**로 설정되어 있고, "— ADVERTISEMENT" 라벨이 자동으로 붙습니다.

---

## 📝 AdSense 신청 절차

### Step 1: 개인정보 처리방침 & 이용약관 페이지 추가

AdSense 승인에 **필수**입니다. 이 페이지가 없으면 자동 거절.

간단한 템플릿은 [https://www.privacypolicies.com](https://www.privacypolicies.com) 같은 곳에서 무료 생성 가능.

AMATOR 라우팅에 추가할 페이지:
- `/privacy` — 개인정보 처리방침
- `/terms` — 이용약관
- `/about` — 사이트 소개 (신뢰도 향상)

### Step 2: 기사 10편 달성

현재 5편. **Notion에 5편 더 쓰시면 됨.** 각 종목에서 1-2편씩.

### Step 3: AdSense 신청

1. https://www.google.com/adsense/start/ 접속
2. 구글 계정 로그인 (lonelyjar2@gmail.com)
3. 사이트 URL 입력: `https://amator.kr`
4. 국가: 대한민국
5. 결제 정보 입력 (통장 계좌)

### Step 4: 사이트에 인증 코드 추가

AdSense에서 주는 `<meta>` 태그 또는 `<script>` 태그를:
- `index.html` `<head>` 안에 붙여넣기
- 커밋 + 푸시 → Cloudflare 재배포

### Step 5: 승인 대기 (1일~2주)

승인되면 이메일로 알림 옴.

---

## ⚙️ 승인 후 활성화 (가장 중요!)

### 1. AdSense 대시보드에서 광고 단위 생성

광고 단위 4개 생성:
- `hero-to-sections` → 광고 슬롯 ID 복사
- `articles-to-shop` → 광고 슬롯 ID 복사
- `latest-to-newsletter` → 광고 슬롯 ID 복사
- `article-body-end` → 광고 슬롯 ID 복사

### 2. Cloudflare Pages 환경변수 추가

Cloudflare Pages → amator 프로젝트 → Settings → Environment variables → Production → Add variable:

| Variable name | Value |
|---|---|
| `VITE_ADSENSE_CLIENT_ID` | `ca-pub-XXXXXXXXXXXXXXXX` (AdSense 게시자 ID) |

Save 후 **Retry deployment**.

### 3. index.html 주석 해제

`index.html`의 head 안에 있는 다음 주석을 해제:

```html
<!-- 주석 해제 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-PUB-ID" crossorigin="anonymous"></script>
```

위 `ca-pub-YOUR-PUB-ID` 부분을 실제 게시자 ID로 교체.

### 4. AdSlot 컴포넌트의 `slot` prop 업데이트

`src/components/AdSlot.tsx`에서 `slot` prop을 실제 슬롯 ID로 매핑:

**Option A (간단):** 코드에서 직접 교체
`src/pages/Home.tsx`의 각 `<AdSlot slot="hero-to-sections" />`에서 `"hero-to-sections"`를 실제 슬롯 숫자(예: `"1234567890"`)로 교체.

**Option B (깔끔):** 환경변수로 관리
```bash
VITE_AD_SLOT_HERO_TO_SECTIONS=1234567890
VITE_AD_SLOT_ARTICLES_TO_SHOP=2345678901
# ...
```

### 5. Push → 재배포 → 광고 자동 활성화

---

## 💰 예상 수익

### CPM (1000회 노출당 수익) 기준:
- 한국 트래픽 평균: ₩1,500 ~ ₩7,500
- 에디토리얼 매거진 (AMATOR 포지셔닝): 평균의 1.5배
- 예상: ₩2,000 ~ ₩10,000 / 1000회 노출

### 월 트래픽별 예상 수익:
| 월 방문자 | 페이지뷰 | 월 AdSense 수익 |
|---|---|---|
| 5,000 | 15,000 | ₩30,000 ~ ₩75,000 |
| 20,000 | 60,000 | ₩120,000 ~ ₩300,000 |
| 50,000 | 150,000 | ₩300,000 ~ ₩750,000 |
| 100,000 | 300,000 | ₩600,000 ~ ₩1,500,000 |

**AdSense만으로는 큰 수익 아님.** 핵심은 어필리에이트 + AdSense + 나중에 직거래 광고 **복합 수익**.

---

## 🎨 광고 스타일 커스터마이징

AdSense 대시보드에서 광고 스타일 설정 가능:
- **배경색:** `#F5F0E8` (AMATOR 크림 배경과 매칭)
- **텍스트색:** `#0A0A0B` (AMATOR 잉크)
- **링크색:** `#C4361C` (AMATOR signal red)
- **테두리:** 없음 (깔끔한 에디토리얼 톤)
- **폰트:** 시스템 기본

이렇게 하면 광고가 AMATOR 디자인과 자연스럽게 녹아듭니다.

---

## ⚠️ 주의사항

### AdSense 정책 위반 시 계정 정지:
1. **스스로 클릭 금지** — 형님이 자기 광고 클릭하면 즉시 정지
2. **친구한테 클릭 요청 금지** — 클릭 유도 불법
3. **광고 위에 "Click here" 같은 문구 금지**
4. **성인 콘텐츠, 폭력, 저작권 침해 콘텐츠 금지**
5. **페이지당 광고 3-4개 이내** (AMATOR는 3개 → 안전)

### 재정 관리:
- 월 수익 ₩100,000 이상 누적 시 자동 지급
- 지급 방법: 통장 직접 입금
- 세금: 사업자등록 시 부가세 신고 대상

---

## 🔗 참고

- AdSense 정책: https://support.google.com/adsense/answer/48182
- 한국 AdSense 세금 FAQ: https://support.google.com/adsense/answer/9749902
- 수익 극대화 팁: https://support.google.com/adsense/answer/9183358

---

*Last updated: 2026-04-21*
