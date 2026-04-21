# AMATOR

> **그냥 좋아서 하는 사람.** Just because I love it.
> A sportswear editorial for serious amateurs — lifting, BJJ, running.

Built by **DUCK DIVE**. 1-person indie project.

---

## Brand

**AMATOR** — from Latin *amātor* ("lover, one who does for love"). The root of the English word *amateur*, taken back to its original meaning: doing it because you love it, not because it pays.

- **한국어 슬로건:** 그냥 좋아서 하는 사람
- **English slogan:** Just because I love it.
- **Target:** 20–40s who train seriously but not professionally. Lifting, BJJ, running.

---

## What this is

A magazine-style affiliate curation site. Visitors pick a country, pick a sport (Gym / BJJ / Running), and get curated gear with links to the right local retailer for their region.

**Phase 1 (current): Korea focus.** Decided via convergent evidence from business data + saju/astrology cross-validation (p < 0.05). Strategy: leverage existing LEO YouTube audience (50K KR subs), dominate the empty "sportswear editorial curation" niche in Korea, then expand.

- 🇰🇷 **Korea — ACTIVE** — Coupang Partners, Musinsa, Fighters Market
- 🇺🇸 **USA — Coming Soon** — Amazon Associates (Phase 2, after KR validation)
- 🇯🇵 **Japan — Coming Soon**
- 🇹🇭 **Thailand — Coming Soon** (via Musinsa Global + FlexOffers)

The 4-flag picker keeps global branding signal while letting the solo-dev focus stay realistic. Flipping `active: true` in `src/country/countries.ts` is all it takes to launch a new country later.

No inventory. No shipping. No customer service. Just links.

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

1. Push this repo to GitHub (`betondoux/amator`).
2. Go to [Cloudflare Pages dashboard](https://dash.cloudflare.com) → **Create a project** → **Connect to Git**.
3. Pick `amator` repo.
4. Build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Deploy. Every `git push` to `main` redeploys automatically.
6. (Optional) Add custom domain `amator.kr` or `amator.co.kr` in Cloudflare Pages settings once purchased.

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
   - Musinsa: via FlexOffers
   - Amazon: from Amazon Associates dashboard (US + Earn Globally)
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

Private project. All rights reserved by DUCK DIVE.
