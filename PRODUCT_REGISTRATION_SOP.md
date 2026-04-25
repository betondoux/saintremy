# 🛒 Saint-Rémy 상품 등록 가이드 (SOP)

**이 문서는 형님이 매주 15개 상품을 Saint-Rémy 사이트에 추가하는 표준 작업 절차입니다.**

각 상품 등록은 **2분**을 목표로 합니다. 숙달되면 1분 이내.

---

## 📋 Quick Start — 지금 당장 해야 할 5가지

### 1. 쿠팡 파트너스 가입 (오늘 30분)

**URL:** https://partners.coupang.com

**필요한 것:**
- 본인 명의 은행 계좌
- 주민등록번호 (세무 처리용)
- 사이트 URL (saintremy.kr — 아직 연결 전이라도 가능)
- 채널 URL: YouTube @saintremy.kr, Instagram @saintremy.kr

**승인:** 보통 즉시 ~ 24시간 이내

**초기 수수료율:**
- 상품 카테고리별 3-9%
- 장바구니 전체 수수료 24시간 쿠키

### 2. 무신사 파트너스 신청 (오늘 10분)

**URL:** https://www.musinsa.com/mz/partners

**승인:** 3-7일

**초기 수수료율:**
- 평균 5-8%
- 패션 카테고리 특화

### 3. Amazon Associates 신청 (이번 주)

**URL:** https://affiliate-program.amazon.com (미국)  
또는 **affiliate.amazon.co.jp** (일본)

**조건:**
- 180일 내 최소 3건 매출 달성
- 미달성 시 계정 비활성화

**추천 전략:** 해외 직구 상품만 소개 (Shoyoroll, Tracksmith 등)

### 4. Notion Products DB 접속 (지금)

이전 턴에 제가 만든 `NOTION_SETUP_GUIDE.md` 참고.  
Integration 연결 후 Cloudflare 환경변수 3개 설정:

```
NOTION_TOKEN=secret_xxxxx
NOTION_DATABASE_ID=xxxxxx  (Articles)
NOTION_PRODUCTS_DATABASE_ID=xxxxxx  (Products)
```

### 5. 이 가이드 북마크

매주 일요일 오전에 이 가이드를 펴놓고 상품 15개 등록.

---

## 🎯 상품 등록 표준 절차 (Step-by-Step)

### 상품 1개당 2분 루틴

#### **Step 1: 상품 찾기 (30초)**

쿠팡, 무신사, 나이키, 아디다스, Amazon 중 선택.

**선정 기준 체크리스트:**
- [ ] 내가 직접 사용해봤거나 깊이 리서치 한 제품인가?
- [ ] 한국 독자가 실제 구매할 수 있는가? (해외 직구 난이도)
- [ ] 디자인이 괜찮은가?
- [ ] 가격이 합리적인가?
- [ ] 관련 기사를 쓸 수 있는 주제인가?

**체크리스트 5개 중 4개 이상 ✅여야 등록.**

#### **Step 2: 어필리에이트 링크 생성 (30초)**

**쿠팡의 경우:**
1. 쿠팡 파트너스 로그인
2. "링크 생성" 메뉴
3. 상품 URL 붙여넣기
4. 단축 링크 복사: `link.coupang.com/a/XXXXX`

**무신사의 경우:**
1. 무신사 파트너스 로그인
2. 상품 검색 또는 URL 입력
3. 파트너 링크 복사

**Nike/Adidas 직접 제휴 (승인 후):**
- Impact.com 또는 Rakuten Advertising 플랫폼 사용

#### **Step 3: Claude로 상품 정보 추출 (30초)**

Claude(저)에게 이렇게 요청:

```
쿠팡 링크: https://coupang.com/vp/products/XXXXXXX

이 상품을 Saint-Rémy에 등록하려고 해. 다음 포맷으로 정리해줘:

{
  "name": "상품명 (35자 이내)",
  "brand": "브랜드명",
  "category": "lift|combat|football|run|flow|court|books 중 하나",
  "price": 280000,
  "originalPrice": 350000,  (세일 없으면 null)
  "dek": "한 줄 설명 (에디토리얼 톤, 30자 내외)",
  "slug": "URL용-slug",
  "vendor": "쿠팡"
}
```

Claude가 즉시 JSON을 뽑아줍니다.

**예시 출력:**
```json
{
  "name": "SBD 10mm 파워리프팅 벨트",
  "brand": "SBD",
  "category": "lift",
  "price": 280000,
  "originalPrice": 350000,
  "dek": "세계 최고의 파워리프팅 벨트. 하지만 용도가 명확할 때만.",
  "slug": "sbd-10mm-lever-belt",
  "vendor": "쿠팡"
}
```

#### **Step 4: 이미지 처리 (15초)**

**3가지 안전한 방법:**

**A. 쿠팡 파트너스 공식 위젯 (가장 안전)**
- 쿠팡 파트너스에서 제공하는 공식 이미지 사용
- 저작권 자동 해결

**B. 브랜드 공식 PR 이미지**
- SBD, Nike 등 공식 사이트 Press/Media 섹션
- 주로 흰 배경 제품 컷

**C. Unsplash 분위기 사진 (가장 추천)**
- 특정 상품 대신 **라이프스타일 이미지**
- "person deadlifting heavy" → SBD 벨트 연상되는 이미지
- 저작권 문제 없음
- **The Strategist 방식과 일치**

**URL을 Notion의 Image 필드에 붙여넣기 or 직접 업로드.**

#### **Step 5: Notion에 입력 (15초)**

Notion Products DB에서 "새 행" 클릭:

| Field | 값 |
|---|---|
| Name | SBD 10mm 파워리프팅 벨트 |
| Brand | SBD |
| Category | lift |
| Price | 280000 |
| OriginalPrice | 350000 |
| Image | (URL 붙여넣기) |
| Dek | 세계 최고의 파워리프팅 벨트. 하지만 용도가 명확할 때만. |
| AffiliateURL | https://link.coupang.com/a/XXXXX |
| Vendor | 쿠팡 |
| Slug | sbd-10mm-lever-belt |
| Featured | ✅ (홈 노출 원하면) |
| RelatedArticleSlug | grip-strength-dementia (선택) |

**저장 → 30분 내 saintremy.kr에 자동 반영.**

---

## 💰 수수료 최적화 전략

### 같은 상품, 어디 링크 걸까?

**예시: 나이키 에어맥스 (₩150,000)**

| 플랫폼 | 수수료율 | 예상 수익 |
|---|---|---|
| 쿠팡 | 3% | ₩4,500 |
| 무신사 | 5% | ₩7,500 |
| Nike 공식 | 8% | ₩12,000 ⭐ |
| Amazon (해외직구) | 4% | ₩6,000 |

→ **Nike 공식 제휴 승인받으면 수수료 2-3배 증가**

### 우선순위 순서 (일반적):

1. 브랜드 공식 제휴 (가능한 경우)
2. 무신사 (패션 카테고리)
3. 쿠팡 (전자/생활용품)
4. Amazon (해외 독점 상품)

### 주의: "높은 수수료"가 "좋은 추천"은 아님

- 수수료율이 낮아도 **독자가 실제로 좋아할 제품**을 추천
- 독자 신뢰 > 단기 수수료

---

## 📊 월별 상품 등록 목표

### 0-3개월 (초기):
- **주 15개** × 12주 = **180개**
- 카테고리 균등 분산

### 4-6개월 (확장):
- **주 10개** (이미 많으면 선별 추가)
- 세일 딜 중심

### 6개월+ (최적화):
- **주 5-10개**
- 기존 상품 업데이트 (가격 변동, 단종 확인)

---

## 🎁 시즌별 큐레이션 가이드

### 1월 (New Year): 새해 다짐 테마
- "운동 시작하는 사람을 위한 7가지"
- 초보자 장비 중심

### 3월 (봄): 야외 운동 시즌
- "한강 러닝 시즌 시작"
- 러닝웨어, 스포츠 선글라스

### 5월 (가정의 달): 선물 가이드
- "아빠에게 주는 헬스 선물 5"
- "어머니 필라테스 입문 세트"

### 7월 (여름): 휴가 & 덥지 않은 실내 운동
- "에어컨 있는 체육관 장비"
- 수영 · 실내 테니스

### 9월 (가을): 본격 운동 시즌
- "가을 마라톤 준비 체크리스트"
- "BJJ 승급 시즌 도복"

### 12월 (연말): 크리스마스 선물
- "운동인을 위한 연말 선물"
- 프리미엄 제품 집중

---

## 🔍 상품 발굴 소스

### 매일 체크하는 사이트:

**국내:**
- 쿠팡 베스트: coupang.com/np/campaigns/82
- 무신사 NEW: musinsa.com
- 29cm: 29cm.co.kr

**해외:**
- The Strategist: nymag.com/strategist (참고용)
- Wirecutter: nytimes.com/wirecutter
- Reddit r/malefashionadvice
- Reddit r/bjj (도복 추천)

**인플루언서:**
- 유튜브 한국 헬스/스포츠 채널 최신 영상
- 인스타 트레이너 추천 제품

### 브랜드 모니터링 리스트:

**LIFT:** SBD, Rogue Fitness, A7, Virus Action Sports, Nike Training  
**COMBAT:** Shoyoroll, Hayabusa, Venum, Kingz, Origin  
**FOOTBALL:** Nike Tiempo, Adidas Predator, Puma Future  
**RUN:** Nike Vaporfly, Adidas Adios Pro, Hoka, On, Tracksmith  
**FLOW:** Lululemon, Alo Yoga, Manduka, Jade Yoga, Beyond Yoga  
**COURT:** Wilson, Yonex, Babolat, Head, Victor

---

## 🚫 등록하면 안 되는 상품

- 유통기한이 있는 제품 (보충제 등 변동 많음) → 주의
- 단종 예정 제품 → 확인 필수
- 가품 의심 상품
- 수수료만 높고 품질 낮은 상품
- 본인이 한 번도 써보지 않고 확신도 없는 상품

---

## ✅ 주간 체크리스트 (매주 일요일)

- [ ] 지난주 등록 상품 링크 동작 확인 (3-5개 샘플)
- [ ] 수수료 정산 내역 확인
- [ ] 이번 주 세일 중인 상품 5개 추가 발굴
- [ ] 기사 ↔ 상품 연결 업데이트 (RelatedArticleSlug)
- [ ] Featured 상품 3-5개 로테이션

**이 루틴으로 3개월 후 등록 상품 200개 돌파.**

---

## 🎯 Month 12 시점 목표

- 누적 상품: **500개**
- 카테고리별 상품 수:
  - LIFT: 100개
  - COMBAT: 80개  
  - FOOTBALL: 60개
  - RUN: 120개
  - FLOW: 80개
  - COURT: 60개
- 월 평균 클릭: 5,000회
- 월 어필리에이트 수수료: ₩240만원

**이 지표들이 Saint-Rémy의 심박수입니다.**

---

## 💡 마지막 한 가지

**The Strategist 편집장의 가장 유명한 말:**

> "Should someone actually buy this?"

모든 상품 등록 전에 이 질문을 스스로에게 하세요. 답이 "Yes, absolutely"가 아니면 등록하지 마세요.

**편집 진정성이 Saint-Rémy의 장기 매출을 만듭니다.**
