/**
 * Express 미들웨어 — admin 보호 라우트에 적용.
 *
 * 1. IP 화이트리스트 (있을 때만)
 * 2. 세션 쿠키 검증
 * 실패 시 401 (API) / 302 redirect (페이지) 분기.
 */
import type { Request, Response, NextFunction } from 'express'
import { SESSION_COOKIE_NAME, validateSession } from './session.ts'
import { isIpAllowed } from './auth.ts'

function clientIp(req: Request): string {
  // Express 5 + trust proxy=loopback. Tailscale 통한 접근은 실제 100.x IP가 req.ip로 들어옴.
  return req.ip ?? req.socket.remoteAddress ?? '0.0.0.0'
}

export function requireAdmin(
  opts: { mode?: 'api' | 'page' } = {}
) {
  const mode = opts.mode ?? 'api'
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = clientIp(req)
    if (!isIpAllowed(ip)) {
      if (mode === 'api') {
        res.status(403).json({ error: 'forbidden', reason: 'ip_not_allowed' })
      } else {
        res.status(403).send('Forbidden — IP not in whitelist')
      }
      return
    }

    const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[
      SESSION_COOKIE_NAME
    ]
    if (!validateSession(token)) {
      if (mode === 'api') {
        res.status(401).json({ error: 'unauthorized' })
      } else {
        res.redirect(302, '/admin/login')
      }
      return
    }

    next()
  }
}

export { clientIp }
