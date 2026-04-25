// scripts/ping-indexnow.ts
//
// IndexNow 프로토콜로 Bing · Yandex · Naver(제한적) 등에 새 URL을 일괄 통보.
// Cloudflare Pages 빌드에서만 실행되도록 가드 — 로컬 빌드는 skip.
//
// 동작 원리:
//   1. sitemap 동일 URL 목록을 articles.json + 카테고리에서 재구성
//   2. https://api.indexnow.org/IndexNow 엔드포인트로 POST
//   3. IndexNow Consortium 참여사에 자동 전파 (Bing, Yandex, Seznam, Yep…)
//
// 소유권 확인:
//   public/<KEY>.txt 파일이 https://saintremy.kr/<KEY>.txt 로 서빙되어야 함.

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const HOST = 'saintremy.kr'
const KEY = process.env.INDEXNOW_KEY ?? '72a5b8e4802229b1c10a567a677388df'
const ARTICLES_JSON = join(process.cwd(), 'src/generated/articles.json')

// 10개 카테고리 slug (App.tsx 일치)
const CATEGORIES = [
  'gift', 'deal', 'style', 'beauty', 'space',
  'kitchen', 'move', 'travel', 'furniture', 'living',
]

const STATIC_PATHS = ['/', '/about', '/shop', '/privacy', '/terms']

interface Article {
  slug: string
}

function loadUrls(): string[] {
  if (!existsSync(ARTICLES_JSON)) {
    console.warn('[indexnow] articles.json 없음 — 빈 목록으로 진행')
    return []
  }
  const articles: Article[] = JSON.parse(readFileSync(ARTICLES_JSON, 'utf-8'))

  const urls = [
    ...STATIC_PATHS.map((p) => `https://${HOST}${p}`),
    ...CATEGORIES.map((c) => `https://${HOST}/${c}`),
    ...articles.map((a) => `https://${HOST}/a/${a.slug}`),
  ]

  return Array.from(new Set(urls))
}

async function main() {
  // 로컬 빌드 skip — Cloudflare Pages 또는 CI 환경에서만 ping
  const isCI = process.env.CF_PAGES === '1' || process.env.CI === 'true'
  if (!isCI) {
    console.log('[indexnow] 로컬 빌드 감지 — ping 생략 (Cloudflare 빌드에서 실행됨)')
    return
  }

  const urls = loadUrls()
  if (urls.length === 0) {
    console.log('[indexnow] URL 없음 — ping 생략')
    return
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  }

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      console.log(
        `[indexnow] ✅ ${urls.length}개 URL 통보 성공 — HTTP ${res.status}`,
      )
    } else {
      const body = await res.text()
      console.warn(
        `[indexnow] ⚠️  응답 ${res.status}: ${body.slice(0, 200)}`,
      )
    }
  } catch (err) {
    // 네트워크 에러 등으로 빌드를 실패시키지 않는다 — warn만.
    console.warn('[indexnow] ping 실패 (빌드는 계속):', err)
  }
}

main()
