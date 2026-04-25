/**
 * /api/admin/health — 설정 점검 + DB 연결 확인.
 * 인증 불필요 (운영자 진단용).
 */
import { Router } from 'express'
import { getDb } from '../lib/db.ts'

export const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  const checks: Record<string, string> = {}
  const warnings: string[] = []

  try {
    const row = getDb().prepare('SELECT 1 as ok').get() as { ok: number } | undefined
    checks.database = row?.ok === 1 ? 'connected' : 'error: unexpected_response'
  } catch (e) {
    checks.database = `error: ${(e as Error).message}`
  }

  checks.anthropic_api_key = process.env.ANTHROPIC_API_KEY ? 'set' : 'missing'
  if (!process.env.ANTHROPIC_API_KEY) {
    warnings.push('ANTHROPIC_API_KEY 미설정 — Day 2 에이전트 기능 사용 불가.')
  }

  checks.admin_password = process.env.ADMIN_PASSWORD_HASH ? 'set' : 'missing'
  if (!process.env.ADMIN_PASSWORD_HASH) {
    warnings.push('ADMIN_PASSWORD_HASH 미설정 — `npm run admin:setup` 실행 필요.')
  }

  checks.session_secret = process.env.SESSION_SECRET ? 'set' : 'missing'
  if (!process.env.SESSION_SECRET) {
    warnings.push('SESSION_SECRET 미설정 — `npm run admin:setup`이 자동 생성합니다.')
  }

  res.json({
    status: warnings.length === 0 ? 'ok' : 'warn',
    version: '0.1.0-day1',
    checks,
    warnings,
  })
})
