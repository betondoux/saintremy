/**
 * 토큰 사용량 → USD 비용 환산 + jobs 테이블에 누적 기록.
 *
 * 기록 위치:
 *   jobs (id, draft_id, type='cost', payload=<agent name>, result=<JSON>, status='done', finished_at)
 *
 * 조회:
 *   getJobCost(draftId)  → 특정 draft 누적 비용
 *   getDailyCost()       → 오늘 (UTC) 누적 비용
 */
import { getDb } from './db.ts'

// 모델별 단가 (USD per token). 2026-04 기준 Anthropic 공시.
// - sonnet-4-5: input $3 / 1M, output $15 / 1M
// - haiku-4-5:  input $0.8 / 1M, output $4 / 1M (참고)
// - opus-4-7:   input $15 / 1M, output $75 / 1M (참고)
type Pricing = { input: number; output: number }
const PRICING: Record<string, Pricing> = {
  'claude-sonnet-4-5': { input: 3 / 1_000_000, output: 15 / 1_000_000 },
  'claude-haiku-4-5': { input: 0.8 / 1_000_000, output: 4 / 1_000_000 },
  'claude-opus-4-7': { input: 15 / 1_000_000, output: 75 / 1_000_000 },
}

export type Usage = {
  input_tokens: number
  output_tokens: number
  cache_creation_input_tokens?: number | null
  cache_read_input_tokens?: number | null
}

export function calculateCost(
  usage: Usage,
  model = 'claude-sonnet-4-5'
): number {
  const p = PRICING[model] ?? PRICING['claude-sonnet-4-5']
  // 캐시 비용은 단순화: cache_read 는 1/10 가격, cache_creation 은 1.25배. 보수적으로 input과 동일 처리.
  const input = usage.input_tokens + (usage.cache_creation_input_tokens ?? 0)
  const cacheRead = usage.cache_read_input_tokens ?? 0
  return input * p.input + cacheRead * p.input * 0.1 + usage.output_tokens * p.output
}

export function recordCost(
  draftId: string,
  agentName: string,
  cost: number,
  usage: Usage,
  model = 'claude-sonnet-4-5'
): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO jobs (draft_id, type, payload, result, status, started_at, finished_at)
     VALUES (?, 'cost', ?, ?, 'done', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  ).run(
    draftId,
    agentName,
    JSON.stringify({
      cost,
      model,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
    })
  )
}

type CostRow = { result: string }

export function getJobCost(draftId: string): number {
  const db = getDb()
  const rows = db
    .prepare(`SELECT result FROM jobs WHERE draft_id = ? AND type = 'cost'`)
    .all(draftId) as CostRow[]
  return sumCosts(rows)
}

export function getDailyCost(): number {
  const db = getDb()
  // 오늘 00:00:00 UTC 부터 (SQLite CURRENT_TIMESTAMP 도 UTC)
  const rows = db
    .prepare(
      `SELECT result FROM jobs
       WHERE type = 'cost'
         AND finished_at >= datetime('now', 'start of day')`
    )
    .all() as CostRow[]
  return sumCosts(rows)
}

function sumCosts(rows: CostRow[]): number {
  let total = 0
  for (const r of rows) {
    try {
      const parsed = JSON.parse(r.result) as { cost?: number }
      if (typeof parsed.cost === 'number') total += parsed.cost
    } catch {
      // skip malformed
    }
  }
  return total
}

export type CostGuardOpts = {
  draftId: string
  maxJob: number
  maxDay: number
}

export function assertCostBudget(opts: CostGuardOpts): void {
  const job = getJobCost(opts.draftId)
  if (job > opts.maxJob) {
    throw new Error(
      `Job cost limit exceeded: $${job.toFixed(4)} > $${opts.maxJob.toFixed(2)} (draft ${opts.draftId})`
    )
  }
  const day = getDailyCost()
  if (day > opts.maxDay) {
    throw new Error(
      `Daily cost limit exceeded: $${day.toFixed(4)} > $${opts.maxDay.toFixed(2)}`
    )
  }
}
