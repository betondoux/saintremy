/**
 * publisher 통합 테스트 (수동 시드 → 발행 → 롤백).
 *
 * 시나리오:
 *   1. 임시 드래프트 INSERT (status=ready, picks=[], step_body_md=mock)
 *   2. publishDraft() 호출 (autoPush=false 강제)
 *   3. 결과 검증: success, filePath, commit, drafts.status='published'
 *   4. cleanup: 생성된 .md 파일 삭제, drafts row 삭제, build:content 재실행으로 articles.json 정리
 *      git reset HEAD~1 (마지막 발행 커밋만 되돌리기) — 발행 후 형님 검수 가능하도록 옵션
 *
 * 실행:
 *   tsx scripts/test-publisher.ts          # cleanup 자동 (git reset)
 *   KEEP=1 tsx scripts/test-publisher.ts   # 결과물 유지 (수동 검수용)
 */
import '../src/admin/server/_loadEnv.ts'
import { v4 as uuid } from 'uuid'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { getDb, closeDb } from '../src/admin/server/lib/db.ts'
import { publishDraft } from '../src/admin/server/lib/publisher.ts'
import { REPO_ROOT } from '../src/admin/server/lib/git-helpers.ts'

const MOCK_BODY = `# 테스트 기사 (publisher 검증)

이 글은 Saint-Rémy Editor publisher 통합 테스트로 자동 생성되었습니다.

## 픽 목록

이 테스트는 어필리에이트 링크 없이 진행되므로 검증 단계는 skip 됩니다.

- 본문 길이 충분 (≥50자)
- frontmatter 가 정상 포함
- build:content 가 통과

## 마무리

테스트가 끝나면 자동으로 git reset HEAD~1 으로 커밋이 제거됩니다 (KEEP=1 환경변수로 유지 가능).
`

async function main() {
  const draftId = uuid()
  const db = getDb()
  const before = lastCommit()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Saint-Rémy Day 3 — publisher integration test')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(` draft id = ${draftId}`)
  console.log(` HEAD before = ${before.slice(0, 7)}`)
  console.log()

  // 1. 시드 — 픽은 비어있어 링크 검증 skip 됨, body 충분
  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, status,
        step_body_md, step_seo, step_picks)
     VALUES (?, ?, ?, ?, ?, 'ready', ?, ?, ?)`
  ).run(
    draftId,
    `[TEST] publisher 검증 — ${draftId.slice(0, 8)}`,
    'deal',
    'this-thing',
    JSON.stringify(['coupang']),
    MOCK_BODY,
    JSON.stringify({
      slug: `_test-publisher-${draftId.slice(0, 6)}`,
      title: '[TEST] publisher 검증',
      description: 'publisher 자동 테스트.',
    }),
    JSON.stringify([])
  )

  // 2. 발행 (autoPush=false 강제)
  const result = await publishDraft(draftId, db, { autoPush: false })
  console.log('result:', JSON.stringify(result, null, 2))

  // 3. 결과 검증
  let pass = 0
  let fail = 0
  const check = (name: string, ok: boolean, extra?: string) => {
    console.log(` ${ok ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`)
    ok ? pass++ : fail++
  }
  check('success=true', result.success === true, result.error)
  check('filePath set', !!result.filePath, result.filePath)
  check('commit set', !!result.commit, result.commit?.slice(0, 7))
  check('pushed=false (forced)', result.pushed === false)
  check(
    'liveUrl 형식',
    !!result.liveUrl?.includes('/deal/'),
    result.liveUrl
  )

  if (result.success && result.filePath) {
    const exists = await fs
      .access(path.resolve(REPO_ROOT, result.filePath))
      .then(() => true)
      .catch(() => false)
    check('파일 디스크 존재', exists)

    const draftAfter = db.prepare('SELECT status, publish_path, publish_commit FROM drafts WHERE id = ?').get(draftId) as any
    check("drafts.status='published'", draftAfter?.status === 'published')
    check('drafts.publish_commit set', !!draftAfter?.publish_commit, draftAfter?.publish_commit?.slice(0, 7))
  }

  console.log()
  console.log(`checks: ${pass} pass, ${fail} fail`)
  console.log()

  // 4. cleanup
  if (process.env.KEEP === '1') {
    console.log('KEEP=1 — 결과물 유지. 수동 검수 후 git reset HEAD~1 또는 git rm 으로 정리하세요.')
  } else {
    console.log('cleanup 시작…')
    if (result.success && result.commit) {
      // 마지막 커밋이 우리가 만든 것인지 확인 후 reset --soft (변경 staged) 후 working tree restore
      const head = lastCommit()
      if (head === result.commit) {
        try {
          execFileSync('git', ['reset', '--hard', 'HEAD~1'], { cwd: REPO_ROOT, stdio: 'ignore' })
          console.log(' ✓ git reset --hard HEAD~1 (테스트 커밋 제거)')
        } catch (err) {
          console.error(' ✗ git reset 실패:', err)
        }
      } else {
        console.warn(`  HEAD(${head.slice(0,7)}) != publish commit(${result.commit.slice(0,7)}) — reset skip. 수동 정리 필요.`)
      }
    } else if (result.filePath) {
      // 빌드 실패 등으로 commit 안 됐지만 파일이 남았다면 제거
      try {
        await fs.unlink(path.resolve(REPO_ROOT, result.filePath))
        console.log(' ✓ orphan .md 제거')
      } catch {
        /* ignore */
      }
    }
    db.prepare('DELETE FROM drafts WHERE id = ?').run(draftId)
    console.log(' ✓ drafts row 삭제')
    // articles.json 재정리
    try {
      execFileSync('npm', ['run', 'build:content'], { cwd: REPO_ROOT, stdio: 'ignore' })
      console.log(' ✓ build:content 재실행 (articles.json 정리)')
    } catch {
      /* ignore */
    }
  }

  closeDb()
  process.exit(fail === 0 ? 0 : 1)
}

function lastCommit(): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf-8' }).trim()
}

main().catch((e) => {
  console.error('fatal:', e)
  process.exit(1)
})
