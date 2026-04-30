import crypto from 'node:crypto'

const DOMAIN = 'https://api-gateway.coupang.com'

export interface CoupangCredentials {
  accessKey: string
  secretKey: string
}

export interface CoupangProduct {
  productId: number
  productName: string
  productPrice: number
  productImage: string
  productUrl: string
  keyword?: string
  rank?: number
  isRocket?: boolean
  isFreeShipping?: boolean
  categoryName?: string
}

export interface CoupangResponse<T> {
  rCode: string
  rMessage: string
  data: T
}

function loadCredentials(): CoupangCredentials {
  const accessKey = process.env.COUPANG_PARTNERS_ACCESS_KEY
  const secretKey = process.env.COUPANG_PARTNERS_SECRET_KEY
  if (!accessKey || !secretKey) {
    throw new Error('COUPANG_PARTNERS_ACCESS_KEY / SECRET_KEY 누락 — .env 확인')
  }
  return { accessKey, secretKey }
}

function buildSignedDate(): string {
  const d = new Date()
  const yy = String(d.getUTCFullYear()).slice(-2)
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mi = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${yy}${mm}${dd}T${hh}${mi}${ss}Z`
}

function buildAuthorizationHeader(method: string, urlPath: string, rawQuery: string): string {
  const { accessKey, secretKey } = loadCredentials()
  const signedDate = buildSignedDate()
  // 쿠팡 시그니처 규칙: message = datetime + method + path + query (? 없는 raw query)
  const message = signedDate + method + urlPath + rawQuery
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex')
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`
}

async function coupangRequest<T>(
  method: 'GET' | 'POST',
  urlPath: string,
  query: Record<string, string | number> = {},
  body?: unknown,
): Promise<CoupangResponse<T>> {
  const rawQuery = Object.keys(query).length
    ? new URLSearchParams(query as Record<string, string>).toString()
    : ''
  const url = DOMAIN + urlPath + (rawQuery ? '?' + rawQuery : '')
  const auth = buildAuthorizationHeader(method, urlPath, rawQuery)
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Coupang ${res.status}: ${text}`)
  }
  return res.json() as Promise<CoupangResponse<T>>
}

// === Endpoints ===

const BASE = '/v2/providers/affiliate_open_api/apis/openapi/v1'

/** 골드박스 (오늘의 핫딜) — 카테고리 무관, 전체 핫딜 */
export async function fetchGoldbox(): Promise<CoupangProduct[]> {
  const r = await coupangRequest<CoupangProduct[]>('GET', `${BASE}/products/goldbox`)
  return r.data ?? []
}

/** 베스트 카테고리 상품 */
export async function fetchBestCategory(categoryId: number, limit = 50): Promise<CoupangProduct[]> {
  const r = await coupangRequest<CoupangProduct[]>(
    'GET',
    `${BASE}/products/bestcategories/${categoryId}`,
    { limit },
  )
  return r.data ?? []
}

/** 키워드 검색 */
export async function searchProducts(keyword: string, limit = 50): Promise<{ productData: CoupangProduct[] }> {
  const r = await coupangRequest<{ productData: CoupangProduct[] }>(
    'GET',
    `${BASE}/products/search`,
    { keyword, limit },
  )
  return r.data ?? { productData: [] }
}

/** 일반 URL → deeplink (어필리에이트 링크) 변환 */
export async function convertDeeplink(coupangUrls: string[]): Promise<Array<{ originalUrl: string; shortenUrl: string; landingUrl: string }>> {
  const r = await coupangRequest<Array<{ originalUrl: string; shortenUrl: string; landingUrl: string }>>(
    'POST',
    `${BASE}/deeplink`,
    {},
    { coupangUrls },
  )
  return r.data ?? []
}

// === Smoke test ===
const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  ;(async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const dotenvPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(dotenvPath)) {
      const text = fs.readFileSync(dotenvPath, 'utf8')
      for (const line of text.split('\n')) {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
        if (m) process.env[m[1]] = m[2].trim()
      }
    }
    console.log('[smoke] goldbox 호출 중…')
    const gb = await fetchGoldbox()
    console.log(`✓ goldbox ${gb.length} 상품`)
    if (gb[0]) {
      console.log('  샘플:', { name: gb[0].productName, price: gb[0].productPrice, url: gb[0].productUrl })
    }
  })().catch((e) => {
    console.error('✗', e.message)
    process.exit(1)
  })
}
