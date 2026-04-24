// scripts/build-content.ts
//
// 빌드 타임에 content/articles/**/*.md 를 읽어 src/generated/articles.json 생성.
// YAML frontmatter → 메타데이터, 본문 → body 필드.
//
// Notion 완전 제거 후의 새 파이프라인. 글은 전부 로컬 .md 파일로 관리.

import matter from 'gray-matter'
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = resolve(__dirname, '../content/articles')
const PRODUCTS_DIR = resolve(__dirname, '../content/products')
const ARTICLES_OUTPUT = resolve(__dirname, '../src/generated/articles.json')
const PRODUCTS_OUTPUT = resolve(__dirname, '../src/generated/products.json')

function walkMdFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_') || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walkMdFiles(full))
    } else if (entry.endsWith('.md')) {
      files.push(full)
    }
  }
  return files
}

function buildArticles() {
  const files = walkMdFiles(ARTICLES_DIR)
  if (files.length === 0) {
    console.log(`ℹ️  ${ARTICLES_DIR} 비어 있음. 기존 articles.json 유지.`)
    return
  }

  const articles = files.map((file) => {
    const raw = readFileSync(file, 'utf-8')
    const { data, content } = matter(raw)

    if (!data.slug) {
      throw new Error(`[build-content] ${file}: slug 누락`)
    }
    if (!data.category) {
      throw new Error(`[build-content] ${file}: category 누락`)
    }
    if (!data.title) {
      throw new Error(`[build-content] ${file}: title 누락`)
    }

    const body = content.trim()

    return {
      id: data.id ?? data.slug,
      ...data,
      body,
    }
  })

  articles.sort((a: any, b: any) =>
    (b.published || '').localeCompare(a.published || ''),
  )

  mkdirSync(dirname(ARTICLES_OUTPUT), { recursive: true })
  writeFileSync(ARTICLES_OUTPUT, JSON.stringify(articles, null, 2))
  console.log(`✅ 기사 ${articles.length}편 컴파일: ${ARTICLES_OUTPUT}`)
}

function buildProducts() {
  const files = walkMdFiles(PRODUCTS_DIR)
  if (files.length === 0) {
    console.log(`ℹ️  ${PRODUCTS_DIR} 비어 있음. products.json 은 빈 배열로 유지.`)
    if (!existsSync(PRODUCTS_OUTPUT)) {
      mkdirSync(dirname(PRODUCTS_OUTPUT), { recursive: true })
      writeFileSync(PRODUCTS_OUTPUT, '[]')
    }
    return
  }

  const products = files.map((file) => {
    const raw = readFileSync(file, 'utf-8')
    const { data, content } = matter(raw)

    if (!data.slug) throw new Error(`[build-content] ${file}: slug 누락`)
    if (!data.name) throw new Error(`[build-content] ${file}: name 누락`)
    if (!data.category) throw new Error(`[build-content] ${file}: category 누락`)

    return {
      id: data.id ?? data.slug,
      ...data,
      description: data.description ?? (content.trim() || undefined),
    }
  })

  mkdirSync(dirname(PRODUCTS_OUTPUT), { recursive: true })
  writeFileSync(PRODUCTS_OUTPUT, JSON.stringify(products, null, 2))
  console.log(`✅ 상품 ${products.length}개 컴파일: ${PRODUCTS_OUTPUT}`)
}

function main() {
  console.log('📝 로컬 마크다운에서 컨텐츠 빌드 중...\n')
  try {
    buildArticles()
    buildProducts()
    console.log('\n✨ 완료.')
  } catch (err: any) {
    console.error('❌ 빌드 에러:', err.message)
    process.exit(1)
  }
}

main()
