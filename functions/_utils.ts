// functions/_utils.ts
// 공용 유틸: 디바이스 감지, IP 해시, JSON 응답 헬퍼

export interface Env {
  DB: D1Database
  IP_SALT?: string
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export function detectDevice(ua: string | null): string {
  if (!ua) return 'unknown'
  const s = ua.toLowerCase()
  if (/bot|crawl|spider|slurp|bingpreview/.test(s)) return 'bot'
  if (/tablet|ipad/.test(s)) return 'tablet'
  if (/mobile|iphone|android|ipod/.test(s)) return 'mobile'
  return 'desktop'
}

export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function parseUtm(url: URL) {
  return {
    utm_source: url.searchParams.get('utm_source') || null,
    utm_medium: url.searchParams.get('utm_medium') || null,
    utm_campaign: url.searchParams.get('utm_campaign') || null,
  }
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('CF-Connecting-IP') ||
    req.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    'unknown'
  )
}

export function getCountry(req: Request): string | null {
  return req.headers.get('CF-IPCountry') || null
}

export function nowMs(): number {
  return Date.now()
}

// session_id 쿠키: 1st-party, 30분 sliding
export function getOrCreateSessionId(
  req: Request,
  res: Response,
): string {
  const cookie = req.headers.get('Cookie') || ''
  const m = cookie.match(/(?:^|;\s*)sr_sid=([^;]+)/)
  if (m) return decodeURIComponent(m[1])
  const sid = crypto.randomUUID()
  res.headers.append(
    'Set-Cookie',
    `sr_sid=${sid}; Path=/; Max-Age=${60 * 30}; SameSite=Lax; Secure; HttpOnly`,
  )
  return sid
}
