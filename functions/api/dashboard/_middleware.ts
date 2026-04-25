// functions/api/dashboard/_middleware.ts
//
// /api/dashboard/* 보호 미들웨어.
// 다음 중 하나가 충족돼야 통과:
//   1. Cloudflare Access (CF_Authorization 쿠키) — production 권장 1차 게이트
//   2. saintremy_admin_session 쿠키 (Express admin 발급) — 같은 도메인일 때
//   3. X-Admin-Token 헤더가 env.ADMIN_DASHBOARD_TOKEN 와 일치 — 자동화/CI용
//
// 모두 실패 시 401. 로컬 dev (vite middleware mode + Express)에선 이 파일이
// 실행되지 않으므로 frontend가 mock 폴백을 사용.
import type { Env } from './_utils'
import { unauthorized } from './_utils'

function hasCookie(req: Request, name: string): boolean {
  const cookie = req.headers.get('Cookie') || ''
  const re = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)
  return re.test(cookie)
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  // 1. Cloudflare Access 통과 시 (운영에선 Cloudflare Dashboard에서 게이트 설정)
  if (hasCookie(request, 'CF_Authorization')) {
    return next()
  }

  // 2. Express admin 세션 쿠키 (같은 도메인)
  if (hasCookie(request, 'saintremy_admin_session')) {
    return next()
  }

  // 3. X-Admin-Token 헤더 (자동화/SSR용)
  const tokenHeader = request.headers.get('X-Admin-Token')
  if (tokenHeader && env.ADMIN_DASHBOARD_TOKEN) {
    if (constantTimeEq(tokenHeader, env.ADMIN_DASHBOARD_TOKEN)) {
      return next()
    }
  }

  return unauthorized('admin_session_or_token_required')
}
