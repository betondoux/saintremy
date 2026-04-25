/**
 * 어필리에이트 링크 환각 방지 — Coupang Partners / 올리브영 / 오늘의집 / 네이버 쇼핑.
 *
 * 1. URL 형식 화이트리스트
 * 2. HEAD/GET 요청으로 200 응답 확인 (timeout 10초, follow redirects)
 * 3. 결과 저장 가능한 직렬화 가능 객체 반환 (drafts.link_validation 컬럼)
 *
 * 발행 게이트: validateAllLinks().allValid 가 false 면 publishDraft() 가 거부.
 */

export type LinkValidationResult = {
  url: string
  valid: boolean
  status?: number
  finalUrl?: string
  error?: string
  productExists?: boolean
  checkedAt: string
}

export type LinkValidationSummary = {
  allValid: boolean
  total: number
  validCount: number
  results: LinkValidationResult[]
  checkedAt: string
}

const ALLOWED_HOSTS: RegExp[] = [
  /^https:\/\/link\.coupang\.com\/a\/[A-Za-z0-9]+/,
  /^https:\/\/(?:www\.)?coupang\.com\//,
  /^https:\/\/(?:www\.)?oliveyoung\.co\.kr\//,
  /^https:\/\/(?:m\.)?ohou\.se\//,
  /^https:\/\/(?:www\.|smartstore\.|shopping\.|brand\.)naver\.com\//,
]

export function isValidAffiliateUrl(url: string): boolean {
  if (typeof url !== 'string' || url.length > 2048) return false
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return false
  } catch {
    return false
  }
  return ALLOWED_HOSTS.some((p) => p.test(url))
}

export async function validateAffiliateLink(
  url: string,
  opts: { timeoutMs?: number } = {}
): Promise<LinkValidationResult> {
  const checkedAt = new Date().toISOString()
  const timeoutMs = opts.timeoutMs ?? 10_000

  if (!isValidAffiliateUrl(url)) {
    return { url, valid: false, error: 'invalid_url_format', checkedAt }
  }

  // 일부 사이트는 HEAD 를 거부하므로 HEAD 시도 후 405/404 일 때 GET 으로 fallback.
  const tryRequest = async (method: 'HEAD' | 'GET'): Promise<Response> =>
    fetch(url, {
      method,
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) SaintRemyEditor/1.0',
        Accept: 'text/html,*/*;q=0.8',
      },
    })

  try {
    let res = await tryRequest('HEAD')
    if (res.status === 405 || res.status === 403 || res.status === 404) {
      // 일부 어필리에이트 호스트는 HEAD 차단 — GET 으로 재시도
      res = await tryRequest('GET')
    }
    return {
      url,
      valid: res.ok,
      status: res.status,
      finalUrl: res.url !== url ? res.url : undefined,
      productExists: res.ok,
      checkedAt,
    }
  } catch (err) {
    const e = err as Error & { name?: string }
    const isTimeout = e?.name === 'TimeoutError' || /timeout|aborted/i.test(e?.message ?? '')
    return {
      url,
      valid: false,
      error: isTimeout ? 'timeout' : (e?.message ?? 'unknown_error'),
      checkedAt,
    }
  }
}

type PickLike = { productUrl?: unknown; product_url?: unknown; url?: unknown }

export function extractUrls(picks: unknown): string[] {
  if (!Array.isArray(picks)) return []
  const urls: string[] = []
  for (const p of picks as PickLike[]) {
    if (!p || typeof p !== 'object') continue
    const u = (p as PickLike).productUrl ?? (p as PickLike).product_url ?? (p as PickLike).url
    if (typeof u === 'string' && u.length > 0) urls.push(u)
  }
  return urls
}

export async function validateAllLinks(
  picks: unknown,
  opts: { timeoutMs?: number; concurrency?: number } = {}
): Promise<LinkValidationSummary> {
  const urls = extractUrls(picks)
  const checkedAt = new Date().toISOString()
  if (urls.length === 0) {
    return { allValid: true, total: 0, validCount: 0, results: [], checkedAt }
  }
  const conc = Math.max(1, Math.min(opts.concurrency ?? 4, 8))
  const results: LinkValidationResult[] = new Array(urls.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(conc, urls.length) }, async () => {
    while (true) {
      const i = cursor++
      if (i >= urls.length) break
      results[i] = await validateAffiliateLink(urls[i], { timeoutMs: opts.timeoutMs })
    }
  })
  await Promise.all(workers)
  const validCount = results.filter((r) => r.valid).length
  return {
    allValid: validCount === results.length,
    total: results.length,
    validCount,
    results,
    checkedAt,
  }
}
