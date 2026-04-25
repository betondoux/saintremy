# Studio 통합 마이그레이션 가이드 (시나리오 A)

> Saint-Rémy Editor + Studio가 단일 admin SPA로 합쳐졌다.
> 작성: 2026-04-25

---

## 한 줄 요약

`studio.saintremy.kr`(별도 프로젝트)에서 운영하던 분석 대시보드 9개 페이지를
amator 의 `/admin/*` 안으로 흡수했다. 같은 D1 DB
(`saintremy-analytics`, `3901046c-2d2c-4de9-bcd7-55ac1fa52d8e`)를
공유하므로 데이터는 그대로 보인다.

---

## 통합 후 구조

```
saintremy.kr/
├── /                      ← 메인 사이트 (cream 톤, 변경 없음)
└── /admin/*               ← 단일 다크 SPA (Editor + Studio)
    ├── /admin/login
    ├── /admin/overview            (Studio)
    ├── /admin/realtime            (Studio)
    ├── /admin/articles            (Studio)
    ├── /admin/products            (Studio)
    ├── /admin/partners            (Studio)
    ├── /admin/funnel              (Studio)
    ├── /admin/traffic             (Studio)
    ├── /admin/ab-tests            (Studio - placeholder)
    ├── /admin/content-health      (Studio)
    ├── /admin/settings            (Studio)
    ├── /admin/dashboard           (Editor — drafts)
    ├── /admin/new                 (Editor — 새 기사)
    └── /admin/articles/:id/preview (Editor — 미리보기 + 발행)

LOCAL DEV (Express @4321):
  /api/admin/auth, /api/admin/dashboard, /api/admin/articles → Express
  /api/dashboard/*  → 미배포 (404) → frontend가 mock 폴백

PRODUCTION (Cloudflare Pages):
  /api/dashboard/*  → functions/api/dashboard/*.ts (D1 직접 SELECT)
                       _middleware.ts가 admin 세션/Access/X-Admin-Token 강제
  /api/events       → 트래커 (변경 없음)
  /go/<slug>/<partner> → 클릭 리다이렉트 (변경 없음)
```

---

## 새로 추가된 파일

```
src/admin/
├── components/Sidebar.tsx                 (좌측 240px, 11 메뉴 + 비용 + 로그아웃)
├── components/PageHeader.tsx
├── components/Stat.tsx
├── components/DataTable.tsx
├── components/Loading.tsx
├── lib/dashboard-api.ts                   (BASE=/api/dashboard, dev → mock 폴백)
├── lib/format.ts
├── lib/useFetch.ts
├── lib/mockData.ts
└── pages/
    ├── Overview.tsx, Realtime.tsx, Articles.tsx, Products.tsx,
    └── Partners.tsx, Funnel.tsx, Traffic.tsx, ABTests.tsx,
        ContentHealth.tsx, Settings.tsx

functions/api/dashboard/
├── _middleware.ts                          (인증: Access | admin 세션 | X-Admin-Token)
├── _utils.ts
├── overview.ts, articles.ts, products.ts, partners.ts,
└── realtime.ts, traffic.ts, funnel.ts, content-health.ts

scripts/
└── sync-d1-articles.ts                    (md → SQL → wrangler d1 execute)

workers/migrations/
└── articles-sync.sql                      (자동 생성, 멱등)
```

수정된 파일: `tailwind.config.js`(ink-{800,600,300,200,100}+accent+ok/warn/err 추가),
`src/admin/styles/admin.css`(다크 변수 + tailwind directives), `src/admin/AdminApp.tsx`,
`src/admin/pages/Dashboard.tsx`, `package.json`(recharts + sync 스크립트).

---

## 운영 워크플로

### 1. 로컬 개발

```bash
# admin SPA + Editor API 함께 실행
npm run admin              # http://127.0.0.1:4321/admin/login

# 대시보드 페이지: 로컬엔 D1이 없으므로 mock 데이터 자동 폴백
#   → Console에 "[mock] /overview — API 미배포(D1 없음), 가짜 데이터 사용" 표시
```

### 2. D1에 발행본 동기화

```bash
# (a) 미리보기 (SQL 파일만 생성)
npm run sync:d1
# → workers/migrations/articles-sync.sql 갱신

# (b) 원격 D1에 적용 (production)
npm run sync:d1:remote
# → wrangler d1 execute saintremy-analytics --remote --file=...

# (c) 로컬 D1에 적용 (wrangler pages dev 시)
npm run sync:d1:local
```

발행 후 Studio Articles 페이지에서 새 기사가 보이려면 이 스크립트를 한 번 돌려야 한다.
(Day 5에서 publisher.ts 마무리에 자동 통합 예정.)

### 3. 인증 (production /api/dashboard 보호)

`functions/api/dashboard/_middleware.ts` 가 다음 중 하나를 요구:

| 방식 | 사용 시점 | 설정 |
|------|-----------|------|
| **Cloudflare Access (`CF_Authorization` 쿠키)** | 운영 브라우저 게이트 | Cloudflare Dashboard → Access |
| **`saintremy_admin_session` 쿠키** | 같은 도메인의 Express admin 세션 | 자동 (login 후) |
| **`X-Admin-Token` 헤더** | 자동화/CI/외부 SSR | `wrangler pages secret put ADMIN_DASHBOARD_TOKEN` |

운영 권장: **1차 Cloudflare Access**(브라우저) + 2차 X-Admin-Token(자동화).

### 4. 통합 테스트 결과 (2026-04-25)

```
✓ npx tsc -b --force            (전체 0 errors)
✓ /admin/login                   200 (SPA HTML)
✓ /admin/overview                200 (SPA HTML, client routes to login if no session)
✓ /api/admin/health              200 (open)
✓ /api/admin/dashboard           401 (no session) — 인증 게이트 동작
✓ npm run sync:d1                6 articles + N products → SQL 멱등 생성
```

---

## studio.saintremy.kr 처리

`saintremy-studio` 별도 Cloudflare Pages 프로젝트는 **선택**:

### 옵션 A — 그대로 두기 (권장 단기)
- studio.saintremy.kr는 백업/폴백으로 유지.
- 운영자가 saintremy.kr/admin/overview를 정식 진입점으로 사용.
- 변경 없음, 비용 무시할 수준 (Pages 무료 플랜).

### 옵션 B — Cloudflare에서 삭제 (정리)
- Cloudflare Dashboard → Pages → `saintremy-studio` 프로젝트 삭제.
- DNS 레코드 `studio.saintremy.kr` 삭제 (또는 saintremy.kr/admin으로 301).
- D1 binding은 amator(saintremy-web) 측에 그대로 남음 → 데이터 손실 없음.

### 옵션 C — 301 리다이렉트
- saintremy-studio Pages를 trivial redirect 함수로 교체:
  ```ts
  export const onRequest = () =>
    Response.redirect('https://saintremy.kr/admin/overview', 301)
  ```

**원본 폴더 (`~/Desktop/saintremy-studio`)는 백업으로 보관 권장.**
이 통합 작업 중 단 한 번도 수정하지 않았다.

---

## 알려진 제약 / 후속 작업

- **A/B Tests 페이지**: Studio도 Phase 4 placeholder 그대로 (구현 X).
- **Settings 페이지**: 파트너 계정 등록 폼은 placeholder.
- **Content Health brokenLinks**: Phase 4 (HEAD 체크 cron).
- **publisher → sync:d1 자동 호출**: Day 5에서 `publisher.ts` 끝에 hook 추가.
- **D1 sessions 공유**: Express admin 세션이 D1에 저장되지 않아
  Cloudflare Pages Functions에서 검증 불가. 현재는 쿠키 존재 여부만 검사.
  완전 검증 필요 시 SESSION_SECRET HMAC + D1 sessions 테이블 도입.

---

## 보호된 영역 (이번 작업에서 건드리지 않음)

- `src/admin/server/agents/`
- `src/admin/server/lib/anthropic-client*.ts`, `cost-tracker.ts`, `jobs-queue.ts`
- `src/components/`, `src/layouts/`
- `functions/api/events.ts`, `functions/go/[slug]/[partner].ts`
- `vite.config.ts`, `tsconfig.json`
- 발행된 기사 6편 (`content/articles/**`)
- `~/Desktop/saintremy-studio/` 원본
