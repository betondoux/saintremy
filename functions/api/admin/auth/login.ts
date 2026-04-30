// /api/admin/auth/login (Cloudflare Pages Function)
//
// 운영 admin SPA용 로그인. POST { password } → ADMIN_PASSWORD 와 비교 후
// 성공 시 saintremy_admin_session 쿠키 발급. 같은 도메인이라 dashboard
// 미들웨어가 그 쿠키만으로 통과시킴.
//
// 로컬 Express admin은 /api/admin/auth/login 을 자체 라우터로 처리하므로
// 이 Function 은 운영 (Cloudflare Pages) 에서만 호출됨.

interface Env {
  ADMIN_PASSWORD?: string
}

const SESSION_COOKIE = 'saintremy_admin_session'
const SESSION_TTL = 7 * 24 * 60 * 60 // 7일

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function randomToken(): string {
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
}

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ADMIN_PASSWORD) {
    return jsonResponse({ error: 'server_misconfigured', reason: 'ADMIN_PASSWORD env not set' }, 500)
  }

  let body: { password?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'invalid_request' }, 400)
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!password) {
    return jsonResponse({ error: 'invalid_request' }, 400)
  }

  if (!constantTimeEq(password, env.ADMIN_PASSWORD)) {
    return jsonResponse({ error: 'invalid_credentials' }, 401)
  }

  const token = randomToken()
  const cookie =
    `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL}`

  return jsonResponse({ ok: true }, 200, { 'Set-Cookie': cookie })
}

// GET 또는 다른 메서드 → 405
export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }
  return jsonResponse({ error: 'unreachable' }, 500)
}
