# Saint Rémy 프로젝트 가이드

이 파일은 Saint Rémy 프로젝트에서 작업할 때 항상 따라야 하는 룰입니다.
모든 작업 시작 전 이 파일을 읽고 룰을 준수하세요.

## 1. 프로젝트 정체성

- **포지션**: "한국의 Wirecutter, 매거진 톤은 Kinfolk 수준"
- **운영자**: LLSV 1인 스튜디오
- **작성자 표기**: 항상 "Saint Rémy Editors" (단일 인물명 절대 노출 금지)
- **언어**: UI는 한국어, URL과 카테고리 slug는 영문

## 2. 기술 스택 (현재 구조)

- 프레임워크: Vite 5 + React 19 + React Router v7
- 호스팅: Cloudflare Pages + Pages Functions
- 콘텐츠: `content/articles/<category>/*.md` → `src/generated/articles.json`
- 빌드: `scripts/build-content.ts` (gray-matter)
- 어드민: better-sqlite3 (admin Studio 전용, 메인 사이트는 정적)
- 어필리에이트 redirect: `functions/go/[slug]/`

## 3. 카테고리 (6개)

기존 11개에서 6개로 통합:

| UI 표시명 | 폴더 / URL slug | 흡수한 기존 카테고리 |
|---|---|---|
| Style | /style | style + beauty |
| Home | /home | kitchen + furniture + living |
| Space | /space | space + move |
| Travel | /travel | travel |
| Music | /music | music |
| Deals | /deals | gift + deal (+ sale 라벨) |

> **명명 규칙**: 폴더명과 URL slug는 모두 소문자 (APFS 호환). 
> UI 표시명은 컴포넌트에서 대문자 첫글자로 렌더링 (예: `style` → "Style").
> categoryLabel은 free-form 유지 (대문자 BEAUTY/SALE/GIFT GUIDES 등 그대로).

기존 11개 URL은 모두 새 카테고리로 redirect (SEO 보호).

## 4. 글 형식 4가지 (frontmatter 스키마, 변경 금지)

기존 코드베이스에 이미 존재하는 4가지 형식 그대로 유지:

- `roundup`: 큐레이션 리스트형 (예: 이번 주 딜 레이더)
- `picks`: 베스트 픽 (예: 3년째 쓰는 것, 10만원의 선택)
- `duelProducts`: 두 제품 비교 (예: THE DUEL)
- `heroProduct + gist`: 단일 제품 심층 리뷰

새 형식을 추가하지 말고, 위 4가지 안에서 작업.

## 5. 톤 룰

### 강제 사항
- 매거진 톤 (Kinfolk 수준 권위)
- 작성자 표기는 "Saint Rémy Editors" 또는 시리즈명만
- 출처 인용 강제 (텍스트 콘텐츠는 1차 출처 2개 이상)
- 사진 출처는 자유 (구글 이미지·인스타·외부 매체 OK)

### 절대 금지어
- TOP 10, 베스트 OO, 충격, 대박, 꿀팁, 알아두세요!
- ~한다고?, 놓치면 후회, 비결, 비밀
- "진짜 좋은", "강추", "ㄹㅇ"
- 1인칭 단수 ("저는", "내가")

### 매 글 상단 강제 삽입 (자동)
> "Saint Rémy는 모든 제품을 독립적으로 검토하고 추천합니다. 본 페이지의 링크를 통해 구매가 발생할 경우, 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 받습니다. → 더 알아보기"

## 6. 디자인 시스템

### 컬러
- 배경: 크림 #F4EFE8
- 본문: #1A1A1A
- 보조: #666666
- 액센트: 보라 #7F77DD ("Ask Saint Rémy" 검색바)
- 가격 강조: #C8362D
- 구분선: 0.5px #E0E0E0

### 폰트
- 제목: Playfair Display (영문) + Noto Serif KR (한글)
- 본문: Noto Serif KR
- UI/메타: Pretendard
- 숫자: JetBrains Mono

## 7. 반응형 (Adaptive Design)

- 모바일 우선 + Tailwind `md:` 분기 (현재 121회 사용 중, 패턴 유지)
- 데스크탑(md 이상)은 Wirecutter 패턴 적용:
  - 메인: 좌측 큰 히어로 + 우측 작은 카드 3개 + 사이드바
  - 카테고리 섹션: 3컬럼 카드 그리드
  - 헤더: 좌측 로고 + 중앙 카테고리 메뉴 + 우측 검색바
- 모바일은 단일 컬럼 + 가로 스크롤 카테고리 칩

## 8. 작업 시 절대 룰

1. 기존 빌드 파이프라인 (`scripts/build-content.ts`) 손대지 않음
2. 4가지 글 형식 스키마 변경 금지 (frontmatter 필드 추가만 OK)
3. 모든 코드 수정 전 `git commit`으로 백업 먼저
4. `categoryLabel`은 free-form 유지 (시리즈 표기에 사용 중)
5. `/a/:slug` 글 상세 라우트 변경 금지 (SEO 보호)
6. `aspect-square` hero 컨테이너 강제 유지 (자동화 사진 1:1 호환)
7. Cloudflare Pages Functions 디렉터리 (`functions/`) 손대지 않음

## 9. 작업 우선순위

새 작업 요청이 들어오면 다음 순서로 처리:

1. 룰 준수 확인 (위 8개 항목)
2. 영향 범위 파악 (기존 18편 글, 11개 redirect 라우트, 4가지 형식)
3. 백업 확인 (git status, 최근 commit)
4. 작업 실행
5. 빌드 테스트 (`npm run build`)
6. 결과 보고

## 10. 자동화 파이프라인 (향후 구축)

`scripts/automation/` 디렉터리에 신설 예정:
- 키워드 큐 → Claude API 초안 생성
- 5단 검증 게이트 (사실·톤·법적·SEO·사람)
- 텔레그램 알림 → 형님 1분 검수
- 승인 시 자동 git commit → Cloudflare Pages 자동 배포

기존 코드와 분리된 디렉터리이므로 메인 사이트와 격리.
