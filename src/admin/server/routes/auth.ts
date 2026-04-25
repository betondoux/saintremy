/**
 * /api/admin/auth/{login,logout}
 */
import { Router } from 'express'
import { verifyPassword } from '../lib/auth.ts'
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
  newSessionToken,
  createSession,
  destroySession,
  isBlocked,
  recordLoginFailure,
  clearLoginAttempts,
} from '../lib/session.ts'
import { clientIp } from '../lib/middleware.ts'

export const authRouter = Router()

authRouter.post('/login', async (req, res, next) => {
  try {
    const ip = clientIp(req)
    if (isBlocked(ip)) {
      res.status(429).json({
        error: 'too_many_attempts',
        message: '로그인 실패 횟수 초과. 1시간 후 다시 시도하세요.',
      })
      return
    }

    const password =
      req.body && typeof req.body.password === 'string' ? (req.body.password as string) : ''
    if (!password) {
      res.status(400).json({ error: 'invalid_request' })
      return
    }

    const ok = await verifyPassword(password)
    if (!ok) {
      const { attempts } = recordLoginFailure(ip)
      res.status(401).json({ error: 'invalid_credentials', attempts })
      return
    }

    clearLoginAttempts(ip)

    const token = newSessionToken()
    createSession(token, ip, req.get('user-agent') ?? '')

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // 옵션 A — localhost만, HTTPS 아님
      path: '/',
      maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    })

    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

authRouter.post('/logout', (req, res) => {
  const cookies = (req as typeof req & { cookies?: Record<string, string> }).cookies
  const token = cookies?.[SESSION_COOKIE_NAME]
  destroySession(token)
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' })
  res.json({ ok: true })
})
