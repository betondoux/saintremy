/**
 * .env.admin 로드 — admin 전용 시크릿(Vite/Cloudflare 의 .env.local 과 격리).
 * 호환을 위해 .env.local 도 fallback 으로 같이 로드(.env.admin 값이 override).
 * src/admin/server/index.ts 의 *최상단* import로 두어 다른 모듈보다 먼저 평가되어야 함.
 *
 * Day 2: 에이전트 안전장치 환경변수 검증/기본값.
 */
import dotenv from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(here, '../../..')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local'), override: false })
dotenv.config({ path: resolve(REPO_ROOT, '.env.admin'), override: true })

// ─── Day 2 안전장치 (기본값) ──────────────────────────
// ADMIN_MOCK_AGENTS=true 면 외부 API 호출 없이 시뮬레이션
process.env.ADMIN_MOCK_AGENTS ??= 'false'
// per-job 비용 상한 (USD)
process.env.ADMIN_MAX_COST_PER_JOB ??= '2'
// 일일 누적 비용 상한 (USD)
process.env.ADMIN_MAX_COST_PER_DAY ??= '10'
// 폼 제출 시 자동 파이프라인 시작
process.env.ADMIN_AUTO_START ??= 'true'
// 부분 실호출: 콤마구분 에이전트 이름 (e.g. "saintremy-editor-in-chief")
process.env.ADMIN_AGENTS_LIVE ??= ''

// ─── 검증 ────────────────────────────────────────────
export type EnvCheckResult = {
  ok: boolean
  warnings: string[]
  errors: string[]
}

export function validateEnv(): EnvCheckResult {
  const warnings: string[] = []
  const errors: string[] = []

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    warnings.push('ANTHROPIC_API_KEY 미설정 — Mock 모드로만 동작 가능.')
  } else if (!apiKey.startsWith('sk-ant-')) {
    errors.push('ANTHROPIC_API_KEY 형식 오류 (sk-ant- 로 시작해야 함).')
  }

  const maxJob = Number(process.env.ADMIN_MAX_COST_PER_JOB)
  if (!Number.isFinite(maxJob) || maxJob <= 0) {
    errors.push('ADMIN_MAX_COST_PER_JOB 이 양수가 아님.')
  }
  const maxDay = Number(process.env.ADMIN_MAX_COST_PER_DAY)
  if (!Number.isFinite(maxDay) || maxDay <= 0) {
    errors.push('ADMIN_MAX_COST_PER_DAY 이 양수가 아님.')
  }

  return { ok: errors.length === 0, warnings, errors }
}
