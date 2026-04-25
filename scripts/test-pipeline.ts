/**
 * Day 2 통합 테스트 스크립트.
 *
 * 시나리오 A — Mock 모드 (외부 API 호출 없음, ~30초)
 *   ADMIN_MOCK_AGENTS=true tsx scripts/test-pipeline.ts
 *
 * 시나리오 B — 부분 라이브 (1단계만 실제, ~$0.05)
 *   ADMIN_AGENTS_LIVE=saintremy-editor-in-chief tsx scripts/test-pipeline.ts
 *
 * 시나리오 C — 비용 가드 검증
 *   ADMIN_MAX_COST_PER_JOB=0.0001 ADMIN_AGENTS_LIVE=* tsx scripts/test-pipeline.ts
 *
 * 결과: 단계별 step_* 컬럼 채워짐 / status 전이 / 비용 추적 확인.
 */
import { EventEmitter } from 'node:events'
import { v4 as uuid } from 'uuid'
// _loadEnv 를 먼저 로드하여 env / 안전장치 기본값 설정
import '../src/admin/server/_loadEnv.ts'
import { getDb, closeDb } from '../src/admin/server/lib/db.ts'
import { runPipeline } from '../src/admin/server/agents/orchestrator.ts'
import { getJobCost, getDailyCost } from '../src/admin/server/lib/cost-tracker.ts'

function fmtMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

async function main() {
  const draftId = uuid()
  const db = getDb()
  const start = Date.now()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Saint-Rémy Day 2 — pipeline integration test')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(` MOCK_AGENTS = ${process.env.ADMIN_MOCK_AGENTS}`)
  console.log(` AGENTS_LIVE = ${process.env.ADMIN_AGENTS_LIVE || '(none)'}`)
  console.log(` MAX_COST_PER_JOB = $${process.env.ADMIN_MAX_COST_PER_JOB}`)
  console.log(` MAX_COST_PER_DAY = $${process.env.ADMIN_MAX_COST_PER_DAY}`)
  console.log(` draft id = ${draftId}`)
  console.log()

  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, custom_instructions, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`
  ).run(
    draftId,
    '[TEST] 무선 청소기 BEST 5 — 진짜 사면 좋은 것',
    'space',
    'best-in-class',
    JSON.stringify(['coupang']),
    '에디터 한 명이 직접 6개월 사용한 톤. 광고 톤 금지.'
  )

  const ee = new EventEmitter()
  ee.on('progress', (e) => {
    const pct = Math.round((e.progress as number) * 100)
    const tag = e.mock ? '[mock]' : `[$${(e.cost ?? 0).toFixed(4)}]`
    console.log(` ${pct.toString().padStart(3)}% │ ${e.step.padEnd(10)} ${e.status.padEnd(7)} ${tag}`)
  })
  ee.on('error', (e) => {
    console.error(` ✗ ERROR @ ${e.step}: ${e.message}`)
    if (e.stack) console.error(e.stack)
  })
  ee.on('done', (e) => {
    console.log(` ✓ DONE — totalCost=$${e.totalCost.toFixed(4)}`)
  })

  const result = await runPipeline(draftId, ee)

  console.log()
  console.log('─── 결과 검증 ───────────────────────────────────')

  type Row = {
    status: string
    step_intake: string | null
    step_trends: string | null
    step_picks: string | null
    step_body_md: string | null
    step_compliance: string | null
    step_seo: string | null
  }
  const final = db.prepare('SELECT * FROM drafts WHERE id = ?').get(draftId) as Row

  const checks = [
    { name: 'status', value: final.status, expected: result.ok ? 'ready' : 'failed' },
    { name: 'step_intake', value: final.step_intake ? 'filled' : 'empty', expected: result.ok ? 'filled' : '*' },
    { name: 'step_trends', value: final.step_trends ? 'filled' : 'empty', expected: result.ok ? 'filled' : '*' },
    { name: 'step_picks', value: final.step_picks ? 'filled' : 'empty', expected: result.ok ? 'filled' : '*' },
    { name: 'step_body_md', value: final.step_body_md ? `${final.step_body_md.length}자` : 'empty', expected: result.ok ? 'filled' : '*' },
    { name: 'step_compliance', value: final.step_compliance ? 'filled' : 'empty', expected: result.ok ? 'filled' : '*' },
    { name: 'step_seo', value: final.step_seo ? 'filled' : 'empty', expected: result.ok ? 'filled' : '*' },
  ]

  let pass = 0
  let fail = 0
  for (const c of checks) {
    const ok =
      c.expected === '*' ||
      c.value === c.expected ||
      (c.expected === 'filled' && c.value !== 'empty')
    console.log(` ${ok ? '✓' : '✗'} ${c.name.padEnd(18)} = ${c.value}${ok ? '' : ` (expected ${c.expected})`}`)
    ok ? pass++ : fail++
  }

  console.log()
  console.log(` jobCost  = $${getJobCost(draftId).toFixed(4)}`)
  console.log(` dayCost  = $${getDailyCost().toFixed(4)}`)
  console.log(` elapsed  = ${fmtMs(Date.now() - start)}`)
  console.log(` checks   = ${pass} pass, ${fail} fail`)
  console.log()

  // 정리: 테스트 draft 삭제 (jobs 도 cascade)
  db.prepare('DELETE FROM drafts WHERE id = ?').run(draftId)
  console.log(' (테스트 draft 정리 완료)')
  closeDb()

  if (fail > 0 || (!result.ok && process.env.EXPECT_FAIL !== 'true')) {
    process.exit(1)
  }
  if (process.env.EXPECT_FAIL === 'true' && result.ok) {
    console.error(' EXPECT_FAIL=true 인데 파이프라인이 성공했음.')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('fatal:', e)
  process.exit(1)
})
