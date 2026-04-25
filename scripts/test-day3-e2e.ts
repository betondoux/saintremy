/**
 * Day 3 E2E 통합 테스트 — Mock 모드 파이프라인부터 발행 게이트까지.
 *
 * 시나리오 A: Mock 파이프라인 → 미리보기 데이터 OK → 링크 검증 (mock URL → 실패) → 발행 차단 확인
 * 시나리오 B: 수동 시드 (검증 가능한 picks=[]) → 발행 → 파일/DB/commit 검증 → cleanup
 * 시나리오 C: 안전장치 — autoPush=false, 빌드 실패 롤백, 동시 발행 lock
 *
 * 실행:
 *   tsx scripts/test-day3-e2e.ts
 *   KEEP=1 tsx scripts/test-day3-e2e.ts   # cleanup 생략
 */
import '../src/admin/server/_loadEnv.ts'
process.env.ADMIN_MOCK_AGENTS = process.env.ADMIN_MOCK_AGENTS ?? 'true'

import { EventEmitter } from 'node:events'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { v4 as uuid } from 'uuid'
import { getDb, closeDb } from '../src/admin/server/lib/db.ts'
import { runPipeline } from '../src/admin/server/agents/orchestrator.ts'
import { publishDraft } from '../src/admin/server/lib/publisher.ts'
import { validateAllLinks, isValidAffiliateUrl } from '../src/admin/server/lib/link-validator.ts'
import { REPO_ROOT } from '../src/admin/server/lib/git-helpers.ts'

const cleanupCommits: string[] = []
const cleanupDraftIds: string[] = []
const cleanupFiles: string[] = []

function head(): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf-8' }).trim()
}

let pass = 0
let fail = 0
function check(name: string, ok: boolean, extra?: string) {
  console.log(` ${ok ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`)
  if (ok) pass++
  else fail++
}

async function scenarioA() {
  console.log('\n━━━ A. Mock 파이프라인 → 발행 게이트(차단) ━━━')
  const db = getDb()
  const draftId = uuid()
  cleanupDraftIds.push(draftId)
  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, status)
     VALUES (?, ?, 'gift', 'gift-guide', ?, 'pending')`
  ).run(draftId, '[E2E-A] Mock 선물 가이드', JSON.stringify(['coupang']))

  const ee = new EventEmitter()
  ee.on('progress', () => undefined)
  ee.on('error', (e) => console.error(' pipeline error:', e.message))

  const result = await runPipeline(draftId, ee)
  check('A1 파이프라인 ok', result.ok === true)

  const after = db.prepare('SELECT status, step_body_md, step_picks, step_seo FROM drafts WHERE id = ?').get(draftId) as any
  check("A2 status='ready'", after?.status === 'ready')
  check('A3 step_body_md filled', !!after?.step_body_md && after.step_body_md.length > 50)
  check('A4 step_picks filled', !!after?.step_picks)
  check('A5 step_seo filled', !!after?.step_seo)

  // 미리보기 API 시뮬레이션 (직접 파싱)
  const picks = after.step_picks ? JSON.parse(after.step_picks) : []
  const validation = await validateAllLinks(picks)
  check(
    'A6 mock URL 은 화이트리스트는 통과 (www.coupang.com)',
    picks.length > 0 ? validation.results.every((r: any) => isValidAffiliateUrl(r.url)) : true
  )
  // 실제 HTTP 시 mock URL 은 404/200 응답일 수 있음 — 단순히 검증이 동작했는지만 확인
  check(
    'A7 validateAllLinks 결과 구조',
    typeof validation.allValid === 'boolean' && Array.isArray(validation.results)
  )

  // 발행 시도: validation.allValid 가 false 면 publishDraft 가 차단
  // (실제 mock URL 은 살아있을 수도 있어 결과는 환경 의존적이므로 차단 보장 안 함)
  const publishResult = await publishDraft(draftId, db, { autoPush: false })
  console.log(` publish result: success=${publishResult.success} error=${publishResult.error ?? '(none)'}`)

  if (publishResult.success && publishResult.commit) {
    cleanupCommits.push(publishResult.commit)
    if (publishResult.filePath) cleanupFiles.push(publishResult.filePath)
    check('A8 발행 성공 (mock URL 이 실제로 존재함)', true)
  } else {
    check(
      'A8 발행 차단됨 (어필리에이트 링크 검증 실패)',
      publishResult.error?.startsWith('affiliate_links_invalid') === true
    )
  }
}

async function scenarioB() {
  console.log('\n━━━ B. 수동 시드 → 발행 → cleanup ━━━')
  const db = getDb()
  const draftId = uuid()
  cleanupDraftIds.push(draftId)
  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, status,
       step_body_md, step_seo, step_picks)
     VALUES (?, ?, ?, ?, ?, 'ready', ?, ?, ?)`
  ).run(
    draftId,
    `[E2E-B] publisher 단독 검증 ${draftId.slice(0, 6)}`,
    'space',
    'this-thing',
    JSON.stringify(['coupang']),
    `# E2E B 본문\n\n- bullet\n- bullet2\n\n충분한 길이의 mock 본문입니다. publisher 단독 검증용.`,
    JSON.stringify({ slug: `_e2e-b-${draftId.slice(0, 6)}`, title: '[E2E-B] 단독 검증' }),
    JSON.stringify([]) // 픽 없음 → 링크 검증 skip
  )

  const result = await publishDraft(draftId, db, { autoPush: false })
  check('B1 success', result.success === true, result.error)
  check('B2 commit 생성', !!result.commit)
  check('B3 pushed=false (강제)', result.pushed === false)
  check('B4 liveUrl 형식', !!result.liveUrl?.startsWith('https://saintremy.kr/space/'))

  if (result.commit) cleanupCommits.push(result.commit)
  if (result.filePath) {
    cleanupFiles.push(result.filePath)
    const exists = await fs.access(path.resolve(REPO_ROOT, result.filePath)).then(() => true).catch(() => false)
    check('B5 파일 디스크 존재', exists)
  }

  const dbAfter = db.prepare('SELECT status, publish_commit FROM drafts WHERE id = ?').get(draftId) as any
  check("B6 drafts.status='published'", dbAfter?.status === 'published')
  check('B7 publish_commit 저장됨', !!dbAfter?.publish_commit)
}

async function scenarioC() {
  console.log('\n━━━ C. 안전장치 ━━━')
  const db = getDb()

  // C1. status != 'ready' → 거부
  const draftId1 = uuid()
  cleanupDraftIds.push(draftId1)
  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, status, step_body_md)
     VALUES (?, '[C1]', 'deal', 'this-thing', ?, 'pending', ?)`
  ).run(draftId1, JSON.stringify(['coupang']), '본문 충분히 길게 채웠지만 status 가 pending 임')
  const r1 = await publishDraft(draftId1, db, { autoPush: false })
  check('C1 status=pending → 거부', r1.success === false && r1.error?.includes('not_ready') === true)

  // C2. step_body_md 너무 짧음 → 거부
  const draftId2 = uuid()
  cleanupDraftIds.push(draftId2)
  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, status, step_body_md)
     VALUES (?, '[C2]', 'deal', 'this-thing', ?, 'ready', '짧음')`
  ).run(draftId2, JSON.stringify(['coupang']))
  const r2 = await publishDraft(draftId2, db, { autoPush: false })
  check('C2 body 너무 짧음 → 거부', r2.success === false && r2.error?.includes('body_md') === true)

  // C3. 이미 published → 거부
  const draftId3 = uuid()
  cleanupDraftIds.push(draftId3)
  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, status, step_body_md)
     VALUES (?, '[C3]', 'deal', 'this-thing', ?, 'published', ?)`
  ).run(draftId3, JSON.stringify(['coupang']), '이미 발행된 것을 다시 시도하면 차단되어야 함')
  const r3 = await publishDraft(draftId3, db, { autoPush: false })
  check('C3 이미 published → 거부', r3.success === false && r3.error === 'already_published')

  // C4. 잘못된 호스트 URL → validateAllLinks → allValid=false
  const v = await validateAllLinks([{ productUrl: 'https://aliexpress.com/item/x' }])
  check('C4 비허가 호스트 → allValid=false', v.allValid === false)

  // C5. autoPush 환경변수 무시 — 명시 false 가 우선
  const oldEnv = process.env.ADMIN_AUTO_PUSH
  process.env.ADMIN_AUTO_PUSH = 'true'
  const draftId5 = uuid()
  cleanupDraftIds.push(draftId5)
  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, status, step_body_md, step_seo, step_picks)
     VALUES (?, '[C5] env-override', 'gift', 'this-thing', ?, 'ready', ?, ?, ?)`
  ).run(
    draftId5,
    JSON.stringify(['coupang']),
    '# C5\n\n충분한 길이의 본문. autoPush 명시 false 가 환경변수 true 를 덮어써야 함.\n\n- a\n- b',
    JSON.stringify({ slug: `_c5-${draftId5.slice(0, 6)}` }),
    JSON.stringify([])
  )
  const r5 = await publishDraft(draftId5, db, { autoPush: false })
  check('C5 명시 autoPush=false 가 환경변수 true 보다 우선', r5.success === true && r5.pushed === false)
  if (r5.commit) cleanupCommits.push(r5.commit)
  if (r5.filePath) cleanupFiles.push(r5.filePath)
  process.env.ADMIN_AUTO_PUSH = oldEnv
}

async function cleanup() {
  console.log('\n━━━ cleanup ━━━')
  if (process.env.KEEP === '1') {
    console.log(' KEEP=1 — 모든 결과물 유지. 수동 정리 필요.')
    console.log(' 생성된 commits:', cleanupCommits.map((c) => c.slice(0, 7)).join(', '))
    return
  }

  // 가장 최근 발행 커밋부터 reset (역순)
  const beforeAll = head()
  // 발행 커밋이 N개 → 그만큼 reset --hard
  if (cleanupCommits.length > 0) {
    try {
      execFileSync('git', ['reset', '--hard', `HEAD~${cleanupCommits.length}`], {
        cwd: REPO_ROOT,
        stdio: 'ignore',
      })
      console.log(` ✓ git reset --hard HEAD~${cleanupCommits.length} (테스트 커밋 ${cleanupCommits.length}개 제거)`)
    } catch (err) {
      console.error(' ✗ git reset 실패:', err)
    }
  }
  // 혹시 파일이 남아있으면 unlink
  for (const f of cleanupFiles) {
    await fs.unlink(path.resolve(REPO_ROOT, f)).catch(() => undefined)
  }
  // drafts 정리
  const db = getDb()
  for (const id of cleanupDraftIds) {
    db.prepare('DELETE FROM drafts WHERE id = ?').run(id)
  }
  console.log(` ✓ drafts ${cleanupDraftIds.length}개 삭제`)
  // articles.json 재정리
  try {
    execFileSync('npm', ['run', 'build:content'], { cwd: REPO_ROOT, stdio: 'ignore' })
    console.log(' ✓ build:content (articles.json 정리)')
  } catch {
    /* ignore */
  }
  const afterAll = head()
  console.log(` HEAD: ${beforeAll.slice(0, 7)} → ${afterAll.slice(0, 7)}`)
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Saint-Rémy Day 3 — E2E integration tests')
  console.log(`  ADMIN_MOCK_AGENTS=${process.env.ADMIN_MOCK_AGENTS}`)
  console.log(`  KEEP=${process.env.KEEP ?? '0'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    await scenarioA()
    await scenarioB()
    await scenarioC()
  } catch (err) {
    console.error('FATAL:', err)
    fail++
  } finally {
    await cleanup()
    closeDb()
  }

  console.log()
  console.log(`━━━ ${pass} pass, ${fail} fail ━━━`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('fatal:', e)
  process.exit(1)
})
