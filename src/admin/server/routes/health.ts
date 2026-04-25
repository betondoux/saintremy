/**
 * /api/admin/health — 설정 점검 + DB 연결 + 일일 비용 + (선택) Anthropic ping.
 * 인증 불필요 (운영자 진단용).
 *
 * 쿼리: ?ping=1 추가 시 Anthropic API 1회 호출 (~$0.0001).
 */
import { Router } from 'express'
import { getDb } from '../lib/db.ts'
import { validateEnv } from '../_loadEnv.ts'
import { getDailyCost } from '../lib/cost-tracker.ts'
import { pingClaude } from '../lib/anthropic-client.ts'

export const healthRouter = Router()

healthRouter.get('/', async (req, res) => {
  const checks: Record<string, string> = {}
  const warnings: string[] = []
  const errors: string[] = []

  // ─── DB ────────────────────────────────────
  try {
    const row = getDb().prepare('SELECT 1 as ok').get() as { ok: number } | undefined
    checks.database = row?.ok === 1 ? 'connected' : 'error: unexpected_response'
  } catch (e) {
    checks.database = `error: ${(e as Error).message}`
    errors.push(`database: ${(e as Error).message}`)
  }

  // ─── 환경변수 ──────────────────────────────
  const envCheck = validateEnv()
  warnings.push(...envCheck.warnings)
  errors.push(...envCheck.errors)

  checks.anthropic_api_key = process.env.ANTHROPIC_API_KEY
    ? process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')
      ? 'set'
      : 'invalid_format'
    : 'missing'
  checks.admin_password = process.env.ADMIN_PASSWORD_HASH ? 'set' : 'missing'
  if (!process.env.ADMIN_PASSWORD_HASH) {
    warnings.push('ADMIN_PASSWORD_HASH 미설정 — `npm run admin:setup` 실행 필요.')
  }
  checks.session_secret = process.env.SESSION_SECRET ? 'set' : 'missing'
  if (!process.env.SESSION_SECRET) {
    warnings.push('SESSION_SECRET 미설정 — `npm run admin:setup`이 자동 생성합니다.')
  }

  // ─── 안전장치 ──────────────────────────────
  checks.mock_agents = process.env.ADMIN_MOCK_AGENTS === 'true' ? 'on' : 'off'
  checks.auto_start = process.env.ADMIN_AUTO_START === 'true' ? 'on' : 'off'
  checks.max_cost_per_job = `$${Number(process.env.ADMIN_MAX_COST_PER_JOB).toFixed(2)}`
  checks.max_cost_per_day = `$${Number(process.env.ADMIN_MAX_COST_PER_DAY).toFixed(2)}`
  if (process.env.ADMIN_AGENTS_LIVE) {
    checks.agents_live = process.env.ADMIN_AGENTS_LIVE
  }

  // ─── 일일 비용 ─────────────────────────────
  let dailyCost = 0
  try {
    dailyCost = getDailyCost()
    checks.daily_cost = `$${dailyCost.toFixed(4)}`
  } catch (e) {
    checks.daily_cost = `error: ${(e as Error).message}`
  }

  // ─── (선택) Anthropic ping ────────────────
  if (req.query.ping === '1' && checks.anthropic_api_key === 'set' && checks.mock_agents === 'off') {
    try {
      const r = await pingClaude()
      checks.anthropic_ping = `ok (${r.model})`
    } catch (e) {
      checks.anthropic_ping = `error: ${(e as Error).message}`
      errors.push(`anthropic_ping: ${(e as Error).message}`)
    }
  }

  const status = errors.length > 0 ? 'error' : warnings.length === 0 ? 'ok' : 'warn'
  res.json({
    status,
    version: '0.2.0-day2',
    checks,
    warnings,
    errors,
    daily_cost_usd: dailyCost,
  })
})
