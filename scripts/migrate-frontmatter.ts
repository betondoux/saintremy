#!/usr/bin/env node
/**
 * Phase 2 frontmatter 마이그레이션 (정규식 기반, line-by-line 교체)
 *
 * 정규식으로 category 줄과 categoryLabel 줄만 정밀 교체.
 * gray-matter.stringify의 부수 변경 완전 회피. diff = 정확히 17줄.
 *
 * 작업 범위:
 *   1. category 필드 매핑 (14편)
 *   2. categoryLabel 부여 (3편)
 *   합계 변경 = 17 (의도한 줄 수 = 17)
 *
 * 사용법:
 *   npx tsx scripts/migrate-frontmatter.ts          # dry-run
 *   npx tsx scripts/migrate-frontmatter.ts --apply  # 실제 수정
 */
import * as fs from 'fs'
import * as path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'articles')

const CATEGORY_MAPPING: Record<string, string> = {
  beauty: 'style',
  kitchen: 'home',
  furniture: 'home',
  living: 'home',
  move: 'space',
  gift: 'deals',
  deal: 'deals',
  style: 'style',
  space: 'space',
  travel: 'travel',
  music: 'music',
}

const LABEL_ASSIGNMENT: Record<string, string> = {
  'deal-radar-2026-04-w4': 'SALE',
  'chet-faker-1998': 'MUSIC',
  'sunscreen-best-5': 'BEAUTY',
}

const EXPECTED_TOTAL_CHANGES = 17
const EXPECTED_FILE_COUNT = 18

function splitFrontmatter(raw: string): { fm: string; body: string; hasFm: boolean } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { fm: '', body: raw, hasFm: false }
  }
  return { fm: match[1], body: match[2], hasFm: true }
}

function joinFrontmatter(fm: string, body: string): string {
  return `---\n${fm}\n---\n${body}`
}

function replaceCategory(
  fm: string,
  newCategory: string,
): { fm: string; changed: boolean; oldValue: string } {
  const regex = /^category:\s*(['"]?)([^'"\r\n]*?)\1\s*$/m
  const match = fm.match(regex)
  if (!match) {
    return { fm, changed: false, oldValue: '' }
  }
  const oldValue = match[2]
  if (oldValue === newCategory) {
    return { fm, changed: false, oldValue }
  }
  const quote = match[1]
  const newLine = `category: ${quote}${newCategory}${quote}`
  const newFm = fm.replace(regex, newLine)
  return { fm: newFm, changed: true, oldValue }
}

function setCategoryLabel(
  fm: string,
  newLabel: string,
): { fm: string; changed: boolean; oldValue: string; existed: boolean } {
  const existingRegex = /^categoryLabel:\s*(['"]?)([^'"\r\n]*?)\1\s*$/m
  const match = fm.match(existingRegex)

  if (match) {
    const oldValue = match[2]
    if (oldValue === newLabel) {
      return { fm, changed: false, oldValue, existed: true }
    }
    const quote = match[1] || "'"
    const newLine = `categoryLabel: ${quote}${newLabel}${quote}`
    const newFm = fm.replace(existingRegex, newLine)
    return { fm: newFm, changed: true, oldValue, existed: true }
  }

  // 기존 라벨 줄 없음 → category 줄 다음에 삽입
  const categoryRegex = /^(category:\s*['"]?[^'"\r\n]*?['"]?\s*)$/m
  const catMatch = fm.match(categoryRegex)
  if (!catMatch) {
    return {
      fm: `categoryLabel: '${newLabel}'\n${fm}`,
      changed: true,
      oldValue: '',
      existed: false,
    }
  }
  const newFm = fm.replace(categoryRegex, `$1\ncategoryLabel: '${newLabel}'`)
  return { fm: newFm, changed: true, oldValue: '', existed: false }
}

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files.sort()
}

function main(dryRun: boolean) {
  const mode = dryRun ? 'DRY-RUN' : 'APPLY'
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Phase 2 frontmatter 마이그레이션 (정규식) — ${mode}`)
  console.log(`${'='.repeat(60)}\n`)

  const mdFiles = findMarkdownFiles(CONTENT_DIR)

  if (mdFiles.length !== EXPECTED_FILE_COUNT) {
    console.log(`⚠️ 글 수 이상: ${mdFiles.length}편 (${EXPECTED_FILE_COUNT}편 예상)`)
    process.exit(1)
  }

  let categoryChanges = 0
  let labelChanges = 0
  let modifiedFiles = 0

  for (const filepath of mdFiles) {
    const slug = path.basename(filepath, '.md')
    const folder = path.basename(path.dirname(filepath))
    const raw = fs.readFileSync(filepath, 'utf8')

    const { fm, body, hasFm } = splitFrontmatter(raw)
    if (!hasFm) {
      console.log(`⚠️ ${folder}/${slug}: frontmatter 없음 — 건너뜀`)
      continue
    }

    let newFm = fm
    const fileChanges: string[] = []

    // 1. category 매핑
    const currentCategoryMatch = newFm.match(/^category:\s*['"]?([^'"\r\n]*?)['"]?\s*$/m)
    const currentCategory = currentCategoryMatch ? currentCategoryMatch[1] : ''
    const newCategory = CATEGORY_MAPPING[currentCategory] ?? currentCategory

    if (currentCategory !== newCategory) {
      const result = replaceCategory(newFm, newCategory)
      if (result.changed) {
        newFm = result.fm
        categoryChanges++
        fileChanges.push(`category: '${result.oldValue}' → '${newCategory}'`)
      }
    }

    // 2. categoryLabel 부여 (LABEL_ASSIGNMENT 대상만)
    if (slug in LABEL_ASSIGNMENT) {
      const targetLabel = LABEL_ASSIGNMENT[slug]
      const result = setCategoryLabel(newFm, targetLabel)
      if (result.changed) {
        newFm = result.fm
        labelChanges++
        const oldDisplay =
          result.oldValue === ''
            ? result.existed
              ? '(빈 값)'
              : '(필드 없음 → 신규)'
            : `'${result.oldValue}'`
        fileChanges.push(`categoryLabel: ${oldDisplay} → '${targetLabel}'`)
      }
    }

    if (fileChanges.length > 0) {
      modifiedFiles++
      console.log(`📄 ${folder}/${slug}.md`)
      fileChanges.forEach((c) => console.log(`   ${c}`))
      console.log()

      if (!dryRun) {
        const newRaw = joinFrontmatter(newFm, body)
        fs.writeFileSync(filepath, newRaw, 'utf8')
      }
    }
  }

  const totalChanges = categoryChanges + labelChanges

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 변환 요약`)
  console.log(`${'='.repeat(60)}`)
  console.log(`  category 변경     : ${categoryChanges}편 (예상: 14)`)
  console.log(`  categoryLabel 부여: ${labelChanges}편 (예상: 3)`)
  console.log(`  ─────────────────`)
  console.log(`  총 변경 횟수       : ${totalChanges} (예상: ${EXPECTED_TOTAL_CHANGES})`)
  console.log(`  수정된 파일 수      : ${modifiedFiles}편`)
  console.log()

  if (totalChanges !== EXPECTED_TOTAL_CHANGES) {
    console.log(`⚠️ 총 변경 횟수가 예상(${EXPECTED_TOTAL_CHANGES})과 다름.`)
    process.exit(1)
  } else {
    console.log('✅ 총 변경 횟수 정확.')
  }
}

const dryRun = !process.argv.includes('--apply')
main(dryRun)
