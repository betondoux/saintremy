# Saint-Rémy 글쓰기 가이드

**Notion은 이제 안 써요.** 모든 글은 이 폴더 안의 `.md` 파일로 관리합니다.

---

## 글 하나 올리는 가장 쉬운 흐름

### 방법 1 — Claude Code에게 시키기 (추천)

터미널에서 `claude` 실행 후 그냥 말하기:

```
"kitchen 카테고리로 '테팔 인제니오 1년 사용기' 글 써줘.
쿠팡 링크는 https://link.coupang.com/a/xxxxx."
```

Claude가 알아서 `content/articles/kitchen/tefal-ingenio-1year.md` 파일을 만들고 본문까지 채워요. 다 되면 저장하고 푸시만 하면 됩니다.

### 방법 2 — 직접 파일 만들기

```bash
npm run new-post -- <카테고리> <slug> "제목"
```

예:
```bash
npm run new-post -- beauty spring-moisturizer-5 "봄철 수분크림 BEST 5"
```

빈 템플릿이 생깁니다. 에디터로 열어서 본문 채우세요.

---

## 발행까지 3줄

```bash
npm run build:content    # 로컬에서 articles.json 재생성 (선택, dev 서버가 자동으로 돌림)
git add . && git commit -m "new post: 제목"
git push
```

Cloudflare Pages가 자동으로 빌드·배포합니다. 보통 1~2분.

---

## 파일 구조

```
content/
└── articles/
    ├── deal/                          # 할인/딜 레이더
    │   └── deal-radar-2026-04-w4.md
    ├── beauty/                        # 뷰티
    │   └── sunscreen-best-5.md
    ├── kitchen/                       # 주방
    ├── style/                         # 스타일
    ├── space/                         # 공간
    ├── gift/                          # 선물
    ├── move/                          # 운동
    ├── travel/                        # 여행
    ├── furniture/                     # 가구
    └── living/                        # 생활
```

10개 카테고리가 정해져 있고, 새 카테고리는 `src/content/articles.ts` 의 `Category` 타입도 같이 수정해야 합니다.

---

## 마크다운 파일 구조

상단의 `---` 로 감싼 블록이 **메타데이터** (YAML 프론트매터),
그 아래가 **본문** (마크다운).

```markdown
---
slug: tefal-ingenio-1year
category: kitchen
title: 테팔 인제니오 1년 사용기
dek: 좁은 주방에서 쓰는 손잡이 분리형 프라이팬의 1년 후기
readTime: 6
published: '2026-04-25'
author: Saint-Rémy Editors
heroImage: /images/articles/tefal-ingenio-1year/hero.jpg
thumbnailColor: '#2A1810'
affiliateDisclosure: >-
  이 기사에는 Saint-Rémy Editors의 어필리에이트 링크가 포함되어 있습니다. 독자의
  구매가 발생할 경우 일정 수수료를 제공받으나, 제품 선정은 독립적으로 이루어집니다.
---

여기부터 본문.

## 섹션 제목

**굵게**, *이탤릭*, [링크](https://...), 이미지 — 기본 마크다운 전부 OK.

- 불릿 리스트
- 두 번째 항목

[쿠팡에서 보기 →](https://link.coupang.com/a/xxxxx)
```

### 이미지와 유튜브 삽입

기존 기사 호환을 위해 본문 안에서 특수 표기:

```
[IMAGE] /images/articles/slug/photo.jpg | 캡션 텍스트
[YOUTUBE] VIDEO_ID
```

이미지 파일은 `public/images/articles/<slug>/` 폴더에 실제 이미지를 넣고 경로로 참조.

### 상품 카드 (딜 레이더 형식)

프론트매터에 `picks` 배열을 넣으면 자동으로 카드 레이아웃으로 렌더링:

```yaml
picks:
  - rank: 1
    name: 제품명
    productImage: /images/articles/slug/pick-1.jpg
    originalPrice: 100000
    salePrice: 70000
    discountRate: 30
    headline: 한 줄 요약
    description: 왜 추천하는지 2~3줄
    productUrl: https://link.coupang.com/a/xxxxx
    ctaLabel: 쿠팡에서 보기
```

정확한 필드 목록은 `src/content/articles.ts` 의 `Pick` 타입 참고.

---

## 어필리에이트 채널

현재 지원 채널:

| 채널 | 링크 형식 |
|---|---|
| 쿠팡 파트너스 | `https://link.coupang.com/a/...` |
| 올리브영 | `https://oy.run/...` |
| 오늘의집 큐레이터 | 컬렉션/상품 URL |
| 네이버 쇼핑 커넥트 | 커넥트 URL |

**공정위 고지 필수**: 모든 글의 프론트매터에 `affiliateDisclosure` 필드 넣을 것. 본문 상단에서 자동으로 렌더링됩니다.

---

## 자주 쓰는 카테고리 값 (slug)

| Slug | 한글 |
|---|---|
| `gift` | 선물 |
| `deal` | 할인 |
| `style` | 스타일 |
| `beauty` | 뷰티 |
| `space` | 공간 |
| `kitchen` | 주방 |
| `move` | 운동 |
| `travel` | 여행 |
| `furniture` | 가구 |
| `living` | 생활 |

---

## 문제 해결

**Q. `npm run build:content` 에러?**
- `slug`, `category`, `title` 이 프론트매터에 빠졌는지 확인
- YAML 들여쓰기 (스페이스 2칸) 맞는지 확인

**Q. 사이트 반영 안 됨?**
- git push 했는지 확인
- Cloudflare Pages 대시보드에서 빌드 로그 확인

**Q. 기존 Notion 데이터 다시 쓰고 싶을 때?**
- `npm run fetch-content:legacy` 로 복구 가능 (Notion 토큰 환경변수 필요)
