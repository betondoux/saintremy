// scripts/migrate-json-to-md.ts
//
// 일회성 이관 스크립트: src/generated/articles.json → content/articles/<category>/<slug>.md
// 기존 Notion 기반 데이터를 로컬 마크다운으로 분리한 뒤 이 파일 삭제해도 됨.

import matter from 'gray-matter'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INPUT = resolve(__dirname, '../src/generated/articles.json')
const OUTPUT_ROOT = resolve(__dirname, '../content/articles')

function main() {
  const articles = JSON.parse(readFileSync(INPUT, 'utf-8'))
  let written = 0

  for (const article of articles) {
    if (!article.slug || !article.category) {
      console.warn(`⚠️  slug/category 누락, 스킵:`, article.title)
      continue
    }

    const { body = '', ...frontmatter } = article
    const outDir = resolve(OUTPUT_ROOT, article.category)
    const outPath = resolve(outDir, `${article.slug}.md`)

    if (existsSync(outPath)) {
      console.log(`↩︎  이미 존재, 스킵: ${outPath}`)
      continue
    }

    mkdirSync(outDir, { recursive: true })
    const md = matter.stringify(body, frontmatter)
    writeFileSync(outPath, md)
    console.log(`✅ ${outPath}`)
    written++
  }

  console.log(`\n총 ${written}편 이관 완료.`)
}

main()
