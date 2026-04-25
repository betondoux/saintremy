/**
 * 6단계 파이프라인 오케스트레이터.
 *
 * 단계별 drafts 컬럼/상태 매핑:
 *   1. intake     → step_intake    , status: queued     → trending
 *   2. trends     → step_trends    , status: trending   → vetting
 *   3. vetting    → step_picks     , status: vetting    → writing
 *   4. copy       → step_body_md   , status: writing    → compliance
 *   5. compliance → step_compliance, status: compliance → seo
 *   6. seo        → step_seo       , status: seo        → ready
 *
 * 진행률(progress 0~1): 단계별 일정 가중치 (총합 1).
 * 에러 시 status='failed', error 이벤트 emit.
 */
import type { EventEmitter } from 'node:events'
import { getDb } from '../lib/db.ts'
import { getJobCost } from '../lib/cost-tracker.ts'
import * as agents from './saintremy.ts'
import type { AgentResult } from './base.ts'
import type { Intake } from './saintremy.ts'

export type DraftRow = {
  id: string
  topic: string
  category: string
  format: string
  channels: string | null
  price_range: string | null
  custom_instructions: string | null
  status: string
}

export type ProgressStep =
  | 'intake'
  | 'trends'
  | 'vetting'
  | 'copy'
  | 'compliance'
  | 'seo'

const STEP_PROGRESS: Record<ProgressStep, { running: number; done: number }> = {
  intake: { running: 0.05, done: 0.15 },
  trends: { running: 0.2, done: 0.35 },
  vetting: { running: 0.4, done: 0.6 },
  copy: { running: 0.65, done: 0.85 },
  compliance: { running: 0.88, done: 0.93 },
  seo: { running: 0.95, done: 1.0 },
}

function emitProgress(
  ee: EventEmitter,
  step: ProgressStep,
  status: 'running' | 'done',
  extra: Record<string, unknown> = {}
): void {
  ee.emit('progress', {
    step,
    status,
    progress: STEP_PROGRESS[step][status],
    ...extra,
  })
}

function setDraftStep(draftId: string, column: string, value: string, status: string): void {
  const db = getDb()
  // column 은 함수 내부에서 화이트리스트로만 호출 — SQL 인젝션 위험 없음.
  db.prepare(
    `UPDATE drafts SET ${column} = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(value, status, draftId)
}

function setDraftStatus(draftId: string, status: string): void {
  getDb()
    .prepare(`UPDATE drafts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(status, draftId)
}

function payload(result: AgentResult): string {
  // parsed 가 있으면 JSON 직렬화, 없으면 raw 그대로
  if (result.parsed !== null && result.parsed !== undefined) {
    return JSON.stringify(result.parsed)
  }
  return result.raw
}

function pickProducts(parsed: unknown): unknown[] {
  if (!parsed || typeof parsed !== 'object') return []
  const obj = parsed as Record<string, unknown>
  if (Array.isArray(obj.products)) return obj.products
  if (Array.isArray(obj.picks)) return obj.picks
  return []
}

export async function runPipeline(
  draftId: string,
  ee: EventEmitter
): Promise<{ ok: true; totalCost: number } | { ok: false; step: ProgressStep; error: string }> {
  const db = getDb()
  const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(draftId) as
    | DraftRow
    | undefined
  if (!draft) {
    const err = { step: 'intake' as ProgressStep, error: 'Draft not found' }
    ee.emit('error', { ...err, message: err.error })
    return { ok: false, ...err }
  }

  let currentStep: ProgressStep = 'intake'
  try {
    setDraftStatus(draftId, 'queued')

    // ─── 1. editor-in-chief ──────────────────────
    currentStep = 'intake'
    emitProgress(ee, 'intake', 'running')
    const intake: Intake = {
      topic: draft.topic,
      category: draft.category,
      format: draft.format,
      channels: draft.channels ? safeArray(draft.channels) : [],
      priceRange: draft.price_range ? safeJSON<Intake['priceRange']>(draft.price_range) : null,
      customInstructions: draft.custom_instructions,
    }
    const intakeResult = await agents.runEditorInChief(intake, draftId)
    setDraftStep(draftId, 'step_intake', payload(intakeResult), 'trending')
    emitProgress(ee, 'intake', 'done', { mock: intakeResult.mock, cost: intakeResult.cost })

    // ─── 2. trend-scout ──────────────────────────
    currentStep = 'trends'
    emitProgress(ee, 'trends', 'running')
    const trendsInput = mergeIntake(intakeResult, intake)
    const trendsResult = await agents.runTrendScout(trendsInput, draftId)
    setDraftStep(draftId, 'step_trends', payload(trendsResult), 'vetting')
    emitProgress(ee, 'trends', 'done', { mock: trendsResult.mock, cost: trendsResult.cost })

    // ─── 3. product-vetter ───────────────────────
    currentStep = 'vetting'
    emitProgress(ee, 'vetting', 'running')
    const vetterInput = {
      ...trendsInput,
      candidates: pickProducts(trendsResult.parsed),
    }
    const vettedResult = await agents.runProductVetter(vetterInput, draftId)
    setDraftStep(draftId, 'step_picks', payload(vettedResult), 'writing')
    emitProgress(ee, 'vetting', 'done', { mock: vettedResult.mock, cost: vettedResult.cost })

    // ─── 4. copy-strategist (Markdown 본문) ─────
    currentStep = 'copy'
    emitProgress(ee, 'copy', 'running')
    const copyInput = {
      ...trendsInput,
      picks: pickProducts(vettedResult.parsed),
    }
    const bodyResult = await agents.runCopyStrategist(copyInput, draftId)
    // 본문은 raw markdown 그대로 저장
    setDraftStep(draftId, 'step_body_md', bodyResult.raw, 'compliance')
    emitProgress(ee, 'copy', 'done', { mock: bodyResult.mock, cost: bodyResult.cost })

    // ─── 5. affiliate-compliance ─────────────────
    currentStep = 'compliance'
    emitProgress(ee, 'compliance', 'running')
    const complianceInput = {
      body_md: bodyResult.raw,
      channels: intake.channels,
    }
    const complianceResult = await agents.runComplianceOfficer(complianceInput, draftId)
    setDraftStep(draftId, 'step_compliance', payload(complianceResult), 'seo')
    emitProgress(ee, 'compliance', 'done', {
      mock: complianceResult.mock,
      cost: complianceResult.cost,
    })

    // ─── 6. seo-architect ────────────────────────
    currentStep = 'seo'
    emitProgress(ee, 'seo', 'running')
    const seoInput = {
      topic: draft.topic,
      category: draft.category,
      body_md: bodyResult.raw,
      picks: pickProducts(vettedResult.parsed),
    }
    const seoResult = await agents.runSeoArchitect(seoInput, draftId)
    setDraftStep(draftId, 'step_seo', payload(seoResult), 'ready')
    emitProgress(ee, 'seo', 'done', { mock: seoResult.mock, cost: seoResult.cost })

    const totalCost = getJobCost(draftId)
    ee.emit('done', { draftId, totalCost })
    return { ok: true, totalCost }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    setDraftStatus(draftId, 'failed')
    ee.emit('error', {
      step: currentStep,
      message,
      stack: process.env.NODE_ENV !== 'production' && err instanceof Error ? err.stack : undefined,
    })
    return { ok: false, step: currentStep, error: message }
  }
}

function safeArray(json: string): string[] {
  try {
    const v = JSON.parse(json)
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function safeJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

function mergeIntake(
  intakeResult: AgentResult,
  fallback: Intake
): Record<string, unknown> {
  const base = fallback as unknown as Record<string, unknown>
  if (intakeResult.parsed && typeof intakeResult.parsed === 'object') {
    return { ...base, ...(intakeResult.parsed as Record<string, unknown>) }
  }
  return { ...base }
}
