// scripts/generate-sitemap.ts
//
// Saint-Rémy sitemap.xml 자동 생성기.
// build:content 로 src/generated/articles.json 이 최신화된 직후 실행됨.
// 출력: public/sitemap.xml  (Vite 가 빌드 시 dist/sitemap.xml 로 복사)

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const BASE_URL = 'https://saintremy.kr'
const ROOT = process.cwd()
const ARTICLES_JSON = join(ROOT, 'src/generated/articles.json')
const OUTPUT = join(ROOT, 'public/sitemap.xml')

// 실제 App.tsx 에 살아있는 카테고리 slug (2026-05-26 기준 매거진 톤 피벗 후).
// 옛 11개 중 redirect-only (gift/deal/beauty/kitchen/move/furniture/living) 는 제거 —
// sitemap 에 박혀 있으면 Google이 색인 실패 페이지로 분류 (Search Console: "리디렉션이 포함된 페이지").
const CATEGORIES = [
  'story',
  'style',
  'home',
  'deals',
  'space',
  'travel',
  'music',
] as const

type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: ChangeFreq
  priority: string
}

interface ArticleRow {
  slug: string
  category: string
  published?: string
  updated?: string
}

function loadArticles(): ArticleRow[] {
  if (!existsSync(ARTICLES_JSON)) {
    console.warn('[sitemap] articles.json 없음 — 빈 리스트로 생성')
    return []
  }
  const raw = readFileSync(ARTICLES_JSON, 'utf-8')
  try {
    return JSON.parse(raw) as ArticleRow[]
  } catch (err) {
    console.error('[sitemap] articles.json 파싱 실패:', err)
    return []
  }
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function buildUrls(articles: ArticleRow[]): SitemapUrl[] {
  const now = today()

  const staticUrls: SitemapUrl[] = [
    // 2026-05-01: prerender-meta가 dist/{route}/index.html 디렉터리 구조로 출력하므로
    // Cloudflare Pages가 trailing slash 없는 URL을 308 → /{route}/ 로 강제 리다이렉트한다.
    // sitemap·canonical 도 trailing slash 형태로 통일해서 한 단계 redirect 제거.
    { loc: `${BASE_URL}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/shop/`, lastmod: now, changefreq: 'weekly', priority: '0.6' },
    { loc: `${BASE_URL}/about/`, lastmod: now, changefreq: 'monthly', priority: '0.4' },
    { loc: `${BASE_URL}/privacy/`, lastmod: now, changefreq: 'yearly', priority: '0.2' },
    { loc: `${BASE_URL}/terms/`, lastmod: now, changefreq: 'yearly', priority: '0.2' },
  ]

  const categoryUrls: SitemapUrl[] = CATEGORIES.map((cat) => ({
    loc: `${BASE_URL}/${cat}/`,
    lastmod: now,
    changefreq: 'weekly',
    priority: '0.8',
  }))

  const articleUrls: SitemapUrl[] = articles.map((a) => ({
    loc: `${BASE_URL}/a/${a.slug}/`,
    lastmod: a.updated ?? a.published ?? now,
    changefreq: 'monthly',
    priority: '0.7',
  }))

  return [...staticUrls, ...categoryUrls, ...articleUrls]
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

function main() {
  const articles = loadArticles()
  const urls = buildUrls(articles)
  const xml = generateXml(urls)
  writeFileSync(OUTPUT, xml, 'utf-8')
  console.log(
    `[sitemap] 생성 완료 — ${OUTPUT} · URL ${urls.length}개 (기사 ${articles.length}편)`,
  )
}

main()
