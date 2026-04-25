# Saint-Rémy

> **평범한 사물을 깊이 보는 매거진.**

Built by **LLSV** (Live your life like a Summer Vacation, 사업자명 "인생을 여름방학처럼"). 1-person indie project.

> **NOTE (2026-04-23):** Saint-Rémy → Saint-Rémy 브랜드 마이그레이션 진행 중.
> 이 README의 브랜드 서사 섹션은 기계 리네이밍 상태이며, Saint-Rémy 정식
> 포지셔닝(지명 어원, 편집 철학 등)은 별도 업데이트 예정. 스택/로컬 개발/
> 배포 섹션은 최신 상태.

---

## Brand

**Saint-Rémy** — _TODO: Provence의 지명에서 유래한 브랜드 서사 작성 예정._

- **슬로건:** 평범한 사물을 깊이 보는 매거진
- **Target:** 덜 사고 더 잘 쓰는 20–40대 한국 독자

---

## What this is

에디토리얼 매거진 형식의 어필리에이트 큐레이션 사이트. 10개 라이프스타일
카테고리(선물 · 할인 · 스타일 · 뷰티 · 공간 · 주방 · 운동 · 여행 · 가구 ·
생활)를 편집자 관점으로 추천하고, 각 상품은 쿠팡 파트너스 / 오늘의집
큐레이터 / 올리브영 쇼핑 큐레이터 등 실제 어필리에이트 링크로 연결됩니다.

재고 없음. 배송 없음. 고객 지원 없음. 링크와 에디토리얼만.

---

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS** (dark, magazine/brutalist aesthetic)
- **React Router v7**
- **Cloudflare Pages** for hosting (free, commercial use allowed, unlimited bandwidth)

---

## Local dev

```bash
npm install
npm run dev
```

Site runs at `http://localhost:5173`.

```bash
npm run build    # production build to ./dist
npm run preview  # serve the build locally
```

---

## Deploy to Cloudflare Pages

1. Push this repo to GitHub (레거시 repo 이름 그대로, rename 예정).
2. Go to [Cloudflare Pages dashboard](https://dash.cloudflare.com) → **Create a project** → **Connect to Git**.
3. Pick repo.
4. Build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Deploy. Every `git push` to `main` redeploys automatically.
6. Custom domain: `saintremy.kr` (Active). 구 도메인은 301 리다이렉트 유지.

`public/_redirects` handles React Router's SPA fallback so direct URLs like `/kr/gym` load correctly.

---

## Project structure

```
src/
├── App.tsx                    # routes + layout shell
├── main.tsx                   # React entry
├── index.css                  # tailwind + base styles
├── country/
│   ├── countries.ts           # KR/US/JP/TH config, active flags, affiliate channel mapping
│   ├── CountryProvider.tsx    # current country state + IP-based initial suggestion
│   └── products.ts            # PRODUCTS array (currently 9 placeholders — replace with real data)
├── i18n/
│   ├── ko.ts                  # Korean copy (incl. legally-required 공정위 disclosure)
│   ├── en.ts                  # English copy
│   └── LocaleProvider.tsx     # locale derives from country, user can override
├── components/
│   ├── DisclosureBar.tsx      # 공정위 / FTC affiliate disclosure (top of every page)
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── AffiliateButton.tsx    # no auto-redirect — user must click (Coupang Partners rule)
└── pages/
    ├── CountryPicker.tsx      # "/" — 4-flag editorial grid
    ├── CountryHome.tsx        # "/:code" — 3 sport cards
    ├── SportPage.tsx          # "/:code/:sport" — product grid + level filter
    └── NotFound.tsx
```

---

## Replacing the dummy products

`src/country/products.ts` currently has 9 placeholders (3 levels × 3 sports). To swap in real data:

1. Replace `brand`, `name`, `image` URL (use brand official imagery — copyright safe).
2. Generate real affiliate links:
   - Coupang Partners: `https://partners.coupang.com/` (AFID: `AF7233291`)
   - 오늘의집 큐레이터 / 올리브영 쇼핑 큐레이터 / LinkPrice: 각 파트너 대시보드
3. Insert into `linksByCountry` with current `price`.
4. Fill in `whyByLocale.ko` and `whyByLocale.en`.

Before going live, replace all `#` placeholder URLs — the UI currently renders them as disabled buttons.

---

## Legal compliance notes

- **Korean 공정위 (2024.12 revision):** Disclosure must appear at the *top* of each page with a definitive statement. The `DisclosureBar` component enforces this.
- **Coupang Partners policy:** No auto-redirect, no floating-banner auto-clicks. The IP detection only *suggests* which region to show — users must click buttons themselves.
- **FTC (US):** The English disclosure follows standard Amazon Associate language.
- **Copyright:** Only use brand-official product imagery.

---

## License

Private project. All rights reserved by LLSV.
