# Saint-Rémy × Notion CMS 설정 가이드

형님이 **Notion에서 글 쓰면 saintremy.kr에 자동 발행**되는 시스템입니다.  
상품도 Notion에서 관리합니다.

총 소요 시간: **30분** (처음 한 번만)

---

## 📋 전체 흐름

```
[1단계] Content DB 생성 (기사용)        — 5분
[2단계] Products DB 생성 (상품용)       — 5분
[3단계] Notion Integration 생성         — 3분
[4단계] 두 DB에 Integration 연결         — 3분
[5단계] Database ID 복사 (2개)          — 2분
[6단계] Cloudflare 환경변수 설정        — 3분
[7단계] 재배포 트리거                   — 1분
[8단계] 첫 글/상품 테스트               — 8분
```

---

# 1단계: Content DB 생성 (기사용)

## 1-1. Notion에 페이지 만들기

1. 왼쪽 사이드바 `+ Add a page` 클릭
2. 이름: `Saint-Rémy`
3. 아이콘: 🏛

## 1-2. 데이터베이스 추가

페이지 본문에서 `/database` 입력 → `Database - Full page` 선택 → 이름: `Content`

## 1-3. 속성 설정

**정확히 아래 이름으로** 입력 (대소문자까지 일치):

| 속성명 | 타입 | 설명 |
|---|---|---|
| `Title` | Title | 기사 제목 |
| `Slug` | Text | URL 영문 (예: `grip-strength-dementia`) |
| `Category` | Select | **옵션**: `gift`, `deal`, `style`, `beauty`, `space`, `kitchen`, `move`, `travel`, `furniture`, `living` (10개) |
| `Dek` | Text | 부제 |
| `Author` | Text | 저자명 (기본: `Saint-Rémy Editors`) |
| `HeroQuote` | Text | 본문 중간 인용구 (선택) |
| `YouTube` | Text | 유튜브 영상 ID (선택) |
| `ReadTime` | Number | 읽기 시간(분) |
| `ThumbColor` | Text | 썸네일 배경색 `#HEX` (선택) |
| `Published` | Checkbox | ⭐ 발행 여부 |
| `PublishDate` | Date | 발행일 |
| `FeaturedOn` | Multi-select | **옵션**: `Hero`, `FilmOfTheWeek`, `MostRead` |

## 1-4. Category 옵션 입력

Category select 클릭 → `+ Add an option` — **영문 slug 그대로** 10개 입력:

| 옵션 (Notion에 입력) | 사이트 표시 |
|---|---|
| `gift` | Gift (선물) |
| `deal` | Deal (할인) |
| `style` | Style (스타일) |
| `beauty` | Beauty (뷰티) |
| `space` | Space (공간) |
| `kitchen` | Kitchen (주방) |
| `move` | Move (운동) |
| `travel` | Travel (여행) |
| `furniture` | Furniture (가구) |
| `living` | Living (생활) |

> 💡 한국어(`선물`, `할인` …)로 입력해도 자동 매핑됩니다. 하지만 URL slug는 영문이므로 **영문 권장**.

---

# 2단계: Products DB 생성 (상품용)

## 2-1. 같은 `Saint-Rémy` 페이지 안에

같은 페이지 본문에서 `/database` 또 입력 → `Database - Inline` 선택 → 이름: `Products`

## 2-2. Products DB 속성 설정

| 속성명 | 타입 | 설명 |
|---|---|---|
| `Name` | Title | 상품명 |
| `Slug` | Text | URL (예: `sbd-lever-belt`) |
| `Brand` | Text | 브랜드 (예: `SBD`, `NIKE`) |
| `Category` | Select | **옵션**: `gift`, `deal`, `style`, `beauty`, `space`, `kitchen`, `move`, `travel`, `furniture`, `living`, `books` (11개) |
| `Dek` | Text | 상품 한 줄 설명 |
| `Description` | Text | 긴 설명 (선택) |
| `Price` | Number | 현재가 (원) |
| `OriginalPrice` | Number | 정가 (세일 시만) |
| `Image` | Files & media | 상품 이미지 (선택) |
| `ThumbColor` | Text | 배경색 `#HEX` (이미지 없을 때) |
| `AffiliateURL` | URL | 쿠팡/네이버/무신사 링크 |
| `Vendor` | Select | **옵션**: `COUPANG`, `NAVER`, `MUSINSA`, `AMAZON`, `BRAND` |
| `Active` | Checkbox | ⭐ 활성 (체크해야 사이트에 표시) |
| `Featured` | Checkbox | 홈페이지 SHOP 섹션에 노출 |
| `RelatedArticleSlug` | Text | 연결된 기사 slug (Saint-Rémy PICK 표시용) |

## 2-3. 상품 첫 번째 추가 예시

```
Name: 이솝 레저렉션 핸드워시
Slug: aesop-resurrection-handwash
Brand: Aesop
Category: beauty
Dek: 매번 손 씻을 때마다 기분이 바뀌는 핸드워시.
Price: 52000
OriginalPrice: 65000
ThumbColor: #5E4B32
AffiliateURL: https://link.coupang.com/a/YOUR-LINK
Vendor: COUPANG
Active: ✅
Featured: ✅
RelatedArticleSlug: (선택)
```

`RelatedArticleSlug`를 입력하면 → 해당 기사 옆 "Saint-Rémy PICK" 자리에 이 상품이 자동 표시됩니다.

---

# 3단계: Notion Integration 생성

## 3-1. 개발자 포털

https://www.notion.so/my-integrations

## 3-2. + New integration

- Name: `Saint-Rémy Site`
- Workspace: 형님 워크스페이스
- Type: `Internal`
- `Submit`

## 3-3. 토큰 복사

**Internal Integration Secret** → `Show` → `Copy`

메모장에 임시 저장: `secret_ABC123...`

⚠️ **절대 GitHub에 올리지 마세요!**

---

# 4단계: 두 DB에 Integration 연결

## 4-1. Content DB 열기

Saint-Rémy 페이지 → Content 데이터베이스 → 우측 상단 `•••`

## 4-2. Add connections → Saint-Rémy Site 선택 → Confirm

## 4-3. Products DB도 같은 방법으로 연결

Products 데이터베이스 → `•••` → `Add connections` → `Saint-Rémy Site` → `Confirm`

---

# 5단계: Database ID 복사 (2개)

## 5-1. Content DB ID

Content 데이터베이스 열기 → `•••` → `Copy link`

URL 형식:
```
https://www.notion.so/workspace/[32자 DATABASE_ID]?v=...
```

워크스페이스명과 `?v=` 사이의 **32자 영숫자 문자열**이 Database ID입니다.

예: `1a2b3c4d5e6f7890abcdef1234567890`

## 5-2. Products DB ID

같은 방법으로 Products 데이터베이스 ID도 복사.

---

# 6단계: Cloudflare 환경변수

## 6-1. 대시보드

https://dash.cloudflare.com → `Workers & Pages` → `saintremy-web`

## 6-2. Settings → Environment variables → Production → Add

3개 추가:

| Variable | Value |
|---|---|
| `NOTION_TOKEN` | `secret_ABC123...` (3단계) |
| `NOTION_DATABASE_ID` | `1a2b3c...` (5-1 Content DB) |
| `NOTION_PRODUCTS_DATABASE_ID` | `5d6e7f...` (5-2 Products DB) |

모두 `Encrypt` 체크 → `Save`.

---

# 7단계: 재배포

Deployments → 최근 배포 `•••` → `Retry deployment`

빌드 로그 확인:
```
📰 Notion에서 기사 가져오는 중...
  ✓ N개 발행된 기사 발견
🛍  Notion에서 상품 가져오는 중...
  ✓ M개 상품 발견
✅ 저장 완료
```

---

# 8단계: 첫 글/상품 테스트

## 매주 발행 루틴 (이제 이게 전부):

### 새 기사:
1. Notion → Content DB → `+ New`
2. Title, Slug, Category, Dek 입력
3. Published ✅ 체크, PublishDate 설정
4. FeaturedOn에 `Hero` 지정 (메인으로 올리려면)
5. 페이지 본문에 글 쓰기 (유튜브 링크/이미지 자유)
6. 저장

### 새 상품:
1. Notion → Products DB → `+ New`
2. Name, Slug, Brand, Category, Price 입력
3. AffiliateURL에 쿠팡 파트너스 링크 붙여넣기
4. Active ✅ + Featured ✅ 체크
5. (옵션) RelatedArticleSlug에 연결할 기사 slug 입력
6. 저장

### 발행:
1. Cloudflare → Deployments → Retry deployment
2. 2-3분 대기
3. `saintremy.kr` 에 새로 반영 ✨

---

# 🎁 고급 팁

## 팁 1: 색상 팔레트 (ThumbColor)

카테고리별 추천 배경색 (이미지 없을 때 썸네일 대신 사용):

| 카테고리 | 분위기 | 색상 코드 |
|---|---|---|
| Gift (선물) | 따뜻한 크래프트 | `#B84A2F` |
| Deal (할인) | 강렬한 레드 | `#E63946` |
| Style (스타일) | 세피아 베이지 | `#A08968` |
| Beauty (뷰티) | 머스타드 크림 | `#D4A574` |
| Space (공간) | 소프트 그레이 | `#8B8680` |
| Kitchen (주방) | 버터밀크 | `#E8C49B` |
| Move (운동) | 다크 브라운 | `#1C1C1C` |
| Travel (여행) | 딥 블루 | `#1A1D2C` |
| Furniture (가구) | 빈티지 오크 | `#7C4A2B` |
| Living (생활) | 포슬린 | `#E0D6C2` |
| Books (책) | 무광 블랙 | `#2C2724` |

## 팁 2: 슬러그 규칙

- 영문만, 하이픈 구분
- 짧고 설명적
- 예: `grip-strength-dementia`, `bjj-ptsd-veterans`

## 팁 3: 유튜브 임베드

Notion에 유튜브 URL 그냥 붙여넣으면 자동 임베드 → 사이트에도 영상으로 표시.

또는 YouTube 필드에 영상 ID만 입력:
```
https://www.youtube.com/watch?v=Iwq9GgOBQt0
                                ↑─────↑
                                 이 부분
```

## 팁 4: 자동 재배포 (선택)

매번 Retry deployment 누르기 귀찮으면:
- Cloudflare Pages → Settings → Build hooks
- `+ Add build hook` → 이름: `notion-publish`
- 생성된 URL 복사
- Zapier/Make로 Notion "Published" 체크 → URL 호출 자동화

지금은 수동으로 시작. 트래픽 쌓이면 자동화.

---

# 🆘 문제 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| 빌드 실패 "database not found" | Integration 연결 안됨 | 4단계 재확인 |
| 빌드 실패 "property does not exist" | 속성명 오타 | 1단계/2단계 속성명 확인 (대소문자!) |
| 글이 안 보임 | Published 체크 안됨 | Notion 체크박스 ✅ |
| 상품이 안 보임 | Active 체크 안됨 | Notion Active ✅ |
| 유튜브 임베드 안됨 | URL 형식 오류 | 영상 ID만 입력 또는 URL 그대로 |
| Hero 기사 안 바뀜 | FeaturedOn 설정 안됨 | 새 기사에 FeaturedOn = Hero |

---

# 📞 문의

막히는 부분 있으면 스크린샷과 함께 Claude에게 말씀해 주세요.

— Saint-Rémy × DUCK DIVE, 2026
