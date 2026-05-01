// scripts/prerender-meta.ts
//
// B-lite 프리렌더 — Puppeteer 없음, 빌드 타임 정적 HTML 주입.
// 목적: Googlebot / 카카오톡 / X 프리뷰가 페이지별 meta 태그를 JS 실행 없이 볼 수 있게 한다.
// 동작: vite build 가 끝난 뒤 dist/index.html 을 템플릿으로 사용,
//   각 라우트(홈·카테고리·기사) 별로 dist/{route}/index.html 을 만들고
//   <title>, <meta description>, <link canonical>, OG/Twitter 태그를 해당 페이지 값으로 교체.
// SPA 내부 네비게이션용 런타임 업데이트는 react-helmet-async 가 담당.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')
const TEMPLATE_PATH = join(DIST, 'index.html')
const ARTICLES_JSON = join(ROOT, 'src/generated/articles.json')

const SITE_URL = 'https://saintremy.kr'
const SITE_NAME = 'Saint-Rémy'
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/social/sunscreen-best-5-social.jpg`

// 10개 카테고리 (App.tsx 의 라우트와 동일)
const CATEGORY_META: Record<
  string,
  { title: string; subtitle: string }
> = {
  gift: { title: '선물', subtitle: '실패하지 않는 선물의 기준.' },
  deal: { title: '할인', subtitle: '놓치면 아쉬운 이번 주 할인.' },
  style: { title: '스타일', subtitle: '덜 사고 더 잘 입는 법.' },
  beauty: { title: '뷰티', subtitle: '허세 없는 피부와 화장품 이야기.' },
  space: { title: '공간', subtitle: '좁아도 답답하지 않은 공간의 원칙.' },
  kitchen: { title: '주방', subtitle: '요리를 바꾸는 도구들.' },
  move: { title: '운동', subtitle: '근력부터 요가까지, 몸을 쓰는 모든 방식.' },
  travel: { title: '여행', subtitle: '짐은 가볍게, 경험은 무겁게.' },
  furniture: {
    title: '가구',
    subtitle: '오래 쓰는 가구, 오래 살아남는 방의 조건.',
  },
  living: { title: '생활', subtitle: '매일 쓰는 것들의 작은 차이.' },
}

interface ArticleRow {
  slug: string
  category: string
  title: string
  dek?: string
  subtitle?: string
  excerpt?: string
  heroImage?: string
  ogImage?: string
  published?: string
  updated?: string
  author?: string
  categoryLabel?: string
}

interface SeoValues {
  title: string
  description: string
  canonical: string
  ogImage: string
  ogType: 'website' | 'article'
  publishedAt?: string
  author?: string
  category?: string
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function absoluteImage(url: string | undefined): string {
  if (!url) return DEFAULT_OG_IMAGE
  if (/^https?:\/\//.test(url)) return url
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// index.html 의 기존 메타를 페이지별 값으로 교체.
// <title>, name="description", og:*, twitter:*, canonical(없으면 삽입).
function injectMeta(template: string, seo: SeoValues): string {
  let html = template

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(seo.title)}</title>`)

  // <meta name="description">
  html = html.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${esc(seo.description)}" />`,
  )

  // <link rel="canonical"> — 없으면 <head> 안에 삽입
  const canonicalTag = `<link rel="canonical" href="${esc(seo.canonical)}" />`
  if (/<link\s+rel="canonical"[^>]*>/i.test(html)) {
    html = html.replace(/<link\s+rel="canonical"[^>]*>/i, canonicalTag)
  } else {
    html = html.replace(/<\/head>/i, `    ${canonicalTag}\n  </head>`)
  }

  // OG 태그들
  const ogReplacements: Array<[RegExp, string]> = [
    [
      /<meta\s+property="og:type"[^>]*>/i,
      `<meta property="og:type" content="${seo.ogType}" />`,
    ],
    [
      /<meta\s+property="og:title"[^>]*>/i,
      `<meta property="og:title" content="${esc(seo.title)}" />`,
    ],
    [
      /<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${esc(seo.description)}" />`,
    ],
    [
      /<meta\s+property="og:image"[^>]*>/i,
      `<meta property="og:image" content="${esc(seo.ogImage)}" />`,
    ],
  ]
  for (const [re, rep] of ogReplacements) {
    if (re.test(html)) html = html.replace(re, rep)
  }

  // og:url — 없으면 og:type 뒤에 삽입
  const ogUrlTag = `<meta property="og:url" content="${esc(seo.canonical)}" />`
  if (/<meta\s+property="og:url"[^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+property="og:url"[^>]*>/i, ogUrlTag)
  } else {
    html = html.replace(
      /(<meta\s+property="og:type"[^>]*>)/i,
      `$1\n    ${ogUrlTag}`,
    )
  }

  // Article 전용 태그 — type=article 인 경우 og:url 뒤에 삽입
  if (seo.ogType === 'article') {
    const articleTags: string[] = []
    if (seo.publishedAt) {
      articleTags.push(
        `<meta property="article:published_time" content="${esc(seo.publishedAt)}" />`,
      )
    }
    if (seo.author) {
      articleTags.push(
        `<meta property="article:author" content="${esc(seo.author)}" />`,
      )
    }
    if (seo.category) {
      articleTags.push(
        `<meta property="article:section" content="${esc(seo.category)}" />`,
      )
    }
    if (articleTags.length > 0) {
      html = html.replace(
        /(<meta\s+property="og:url"[^>]*>)/i,
        `$1\n    ${articleTags.join('\n    ')}`,
      )
    }
  }

  // Twitter
  const twitterReplacements: Array<[RegExp, string]> = [
    [
      /<meta\s+name="twitter:title"[^>]*>/i,
      `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    ],
    [
      /<meta\s+name="twitter:description"[^>]*>/i,
      `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    ],
    [
      /<meta\s+name="twitter:image"[^>]*>/i,
      `<meta name="twitter:image" content="${esc(seo.ogImage)}" />`,
    ],
  ]
  for (const [re, rep] of twitterReplacements) {
    if (re.test(html)) html = html.replace(re, rep)
  }

  return html
}

function writeRoute(routePath: string, html: string) {
  // routePath: '/', '/beauty', '/a/sunscreen-best-5' …
  const outDir =
    routePath === '/' ? DIST : join(DIST, routePath.replace(/^\//, ''))
  const outFile = join(outDir, 'index.html')
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, html, 'utf-8')
}

function loadArticles(): ArticleRow[] {
  if (!existsSync(ARTICLES_JSON)) return []
  return JSON.parse(readFileSync(ARTICLES_JSON, 'utf-8')) as ArticleRow[]
}

function buildDescription(article: ArticleRow): string {
  const raw = article.dek ?? article.subtitle ?? article.excerpt ?? ''
  const cleaned = raw.replace(/\s+/g, ' ').trim()
  if (cleaned.length === 0) {
    return `${SITE_NAME} — ${article.title}`
  }
  // Google 권장 160자 내외
  return cleaned.length > 155 ? `${cleaned.slice(0, 152)}...` : cleaned
}

function main() {
  if (!existsSync(TEMPLATE_PATH)) {
    console.error(`[prerender-meta] ${TEMPLATE_PATH} 없음 — vite build 먼저 실행`)
    process.exit(1)
  }

  const template = readFileSync(TEMPLATE_PATH, 'utf-8')
  const articles = loadArticles()

  let count = 0

  // 홈 — 기존 dist/index.html 도 canonical / og:url 을 확실히 넣어두기 위해 다시 씀.
  {
    const seo: SeoValues = {
      title: `${SITE_NAME} | 평범한 사물을 깊이 보는 매거진`,
      description:
        '매일 쏟아지는 제품의 홍수 속, 진짜 좋은 것만 큐레이션합니다. 선물 · 할인 · 스타일 · 뷰티 · 공간 · 주방 · 운동 · 여행 · 가구 · 생활.',
      canonical: `${SITE_URL}/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
    }
    writeRoute('/', injectMeta(template, seo))
    count++
  }

  // 카테고리 — Cloudflare Pages가 trailing slash 강제하므로 canonical도 /로 끝나게.
  for (const [slug, meta] of Object.entries(CATEGORY_META)) {
    const seo: SeoValues = {
      title: `${meta.title} — ${SITE_NAME}`,
      description: `${meta.subtitle} ${SITE_NAME}의 ${meta.title} 카테고리 큐레이션.`,
      canonical: `${SITE_URL}/${slug}/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
    }
    writeRoute(`/${slug}`, injectMeta(template, seo))
    count++
  }

  // 기사
  for (const article of articles) {
    const categoryLabel =
      article.categoryLabel ??
      CATEGORY_META[article.category]?.title ??
      article.category
    const seo: SeoValues = {
      title: `${article.title} | ${SITE_NAME}`,
      description: buildDescription(article),
      canonical: `${SITE_URL}/a/${article.slug}/`,
      ogImage: absoluteImage(article.ogImage ?? article.heroImage),
      ogType: 'article',
      publishedAt: article.published,
      author: article.author ?? 'Saint-Rémy Editors',
      category: categoryLabel,
    }
    writeRoute(`/a/${article.slug}`, injectMeta(template, seo))
    count++
  }

  // 고정 페이지
  const staticPages: Array<[string, string, string]> = [
    ['/about', `About — ${SITE_NAME}`, `${SITE_NAME}의 편집 원칙과 팀 소개.`],
    ['/shop', `Shop — ${SITE_NAME}`, `${SITE_NAME}가 고른 제품을 한곳에서.`],
    [
      '/privacy',
      `개인정보처리방침 — ${SITE_NAME}`,
      `${SITE_NAME} 개인정보처리방침.`,
    ],
    ['/terms', `이용약관 — ${SITE_NAME}`, `${SITE_NAME} 이용약관.`],
  ]
  for (const [path, title, description] of staticPages) {
    const seo: SeoValues = {
      title,
      description,
      canonical: `${SITE_URL}${path}/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
    }
    writeRoute(path, injectMeta(template, seo))
    count++
  }

  console.log(`[prerender-meta] 생성 완료 — ${count}개 경로`)
}

main()
