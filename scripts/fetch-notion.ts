// scripts/fetch-notion.ts
//
// 빌드 타임에 Notion에서 데이터를 가져와 JSON 파일로 저장.
//
// 두 개의 데이터베이스를 지원:
//   1. NOTION_DATABASE_ID           — AMATOR Content (기사) 데이터베이스
//   2. NOTION_PRODUCTS_DATABASE_ID  — AMATOR Products (상품) 데이터베이스 (선택)
//
// 환경변수가 없으면 기존 generated/*.json 폴백 유지.
//
// Notion API v2026-03-11 사용.

import { Client, isFullPage } from '@notionhq/client'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ARTICLES_OUTPUT = resolve(__dirname, '../src/generated/articles.json')
const PRODUCTS_OUTPUT = resolve(__dirname, '../src/generated/products.json')

// ─────────────────────────────────────────────────────────────
// 환경변수
// ─────────────────────────────────────────────────────────────
const NOTION_TOKEN = process.env.NOTION_TOKEN
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID
const NOTION_PRODUCTS_DATABASE_ID = process.env.NOTION_PRODUCTS_DATABASE_ID

if (!NOTION_TOKEN) {
  console.warn('⚠️  NOTION_TOKEN 환경변수 없음.')
  console.warn('   generated/*.json 파일을 폴백으로 유지합니다.')
  console.warn('   Cloudflare Pages 환경변수에 추가하세요:')
  console.warn('     NOTION_TOKEN=secret_xxx')
  console.warn('     NOTION_DATABASE_ID=xxx (기사용)')
  console.warn('     NOTION_PRODUCTS_DATABASE_ID=xxx (상품용, 선택)')
  process.exit(0)
}

if (!NOTION_DATABASE_ID) {
  console.warn('⚠️  NOTION_DATABASE_ID 없음. 기사 fetch 스킵.')
}

// ─────────────────────────────────────────────────────────────
// Notion 클라이언트
// ─────────────────────────────────────────────────────────────
const notion = new Client({
  auth: NOTION_TOKEN,
  notionVersion: '2026-03-11',
})

// ─────────────────────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────────────────────
// 10개 라이프스타일 카테고리 (기사). 문자열로 받아 downstream에서 정규화.
// 허용 값: gift / deal / style / beauty / space / kitchen / move / travel / furniture / living
// 레거시 6스포츠(lift/combat/football/run/flow/court)는 downstream에서 move로 매핑됨.
interface Article {
  id: string
  slug: string
  category: string
  title: string
  dek: string
  readTime: number
  published: string
  author: string
  heroQuote?: string
  youtube?: string
  thumbnailColor?: string
  featuredOn: string[]
  body: string
}

// 10개 라이프스타일 + books (상품).
interface Product {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice?: number
  image?: string
  thumbnailColor?: string
  dek: string
  description?: string
  affiliateURL: string
  vendor: string
  featured?: boolean
  relatedArticleSlug?: string
}

// 한국어 라벨 → 영문 slug 매핑 (Notion Select를 한국어로 썼을 때 대응)
const KO_TO_SLUG: Record<string, string> = {
  '선물': 'gift',
  '할인': 'deal',
  '스타일': 'style',
  '뷰티': 'beauty',
  '공간': 'space',
  '주방': 'kitchen',
  '운동': 'move',
  '여행': 'travel',
  '가구': 'furniture',
  '생활': 'living',
  '책': 'books',
}

function normalizeCategoryString(raw: string): string {
  const trimmed = raw.trim()
  if (KO_TO_SLUG[trimmed]) return KO_TO_SLUG[trimmed]
  return trimmed.toLowerCase()
}

// ─────────────────────────────────────────────────────────────
// Notion 속성 파싱 헬퍼
// ─────────────────────────────────────────────────────────────
function getRichText(property: any): string {
  if (!property || !property.rich_text) return ''
  return property.rich_text
    .map((t: any) => t.plain_text || '')
    .join('')
    .trim()
}

function getTitle(property: any): string {
  if (!property || !property.title) return ''
  return property.title
    .map((t: any) => t.plain_text || '')
    .join('')
    .trim()
}

function getSelect(property: any): string {
  return property?.select?.name ?? ''
}

function getMultiSelect(property: any): string[] {
  if (!property?.multi_select) return []
  return property.multi_select.map((s: any) => s.name)
}

function getCheckbox(property: any): boolean {
  return property?.checkbox ?? false
}

function getNumber(property: any): number {
  return property?.number ?? 0
}

function getDate(property: any): string {
  return property?.date?.start ?? new Date().toISOString().slice(0, 10)
}

function getURL(property: any): string {
  return property?.url ?? ''
}

function getFileURL(property: any): string | undefined {
  if (!property?.files || property.files.length === 0) return undefined
  const file = property.files[0]
  return file.external?.url || file.file?.url
}

// ─────────────────────────────────────────────────────────────
// Notion 블록 → 마크다운 변환
// ─────────────────────────────────────────────────────────────
async function getPageBody(pageId: string): Promise<string> {
  const blocks: any[] = []
  let cursor: string | undefined

  do {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    })
    blocks.push(...response.results)
    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return blocks.map(blockToMarkdown).filter(Boolean).join('\n\n')
}

function blockToMarkdown(block: any): string {
  const type = block.type
  const data = block[type]

  switch (type) {
    case 'paragraph':
      return richTextToString(data.rich_text)
    case 'heading_1':
    case 'heading_2':
      return `## ${richTextToString(data.rich_text)}`
    case 'heading_3':
      return `### ${richTextToString(data.rich_text)}`
    case 'bulleted_list_item':
      return `• ${richTextToString(data.rich_text)}`
    case 'numbered_list_item':
      return `1. ${richTextToString(data.rich_text)}`
    case 'quote':
    case 'callout':
      return `> ${richTextToString(data.rich_text)}`
    case 'code':
      return '```\n' + richTextToString(data.rich_text) + '\n```'
    case 'divider':
      return '---'
    case 'embed':
      return `[EMBED] ${data.url}`
    case 'video':
      if (data.external?.url) {
        const match = data.external.url.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
        )
        if (match) return `[YOUTUBE] ${match[1]}`
      }
      return ''
    case 'image': {
      const url = data.external?.url || data.file?.url
      const caption = richTextToString(data.caption)
      if (!url) return ''
      return `[IMAGE] ${url}${caption ? ' | ' + caption : ''}`
    }
    default:
      return ''
  }
}

function richTextToString(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  return richText
    .map((t: any) => {
      const text = t.plain_text || ''
      const { bold, italic, code } = t.annotations || {}
      if (bold) return `**${text}**`
      if (italic) return `*${text}*`
      if (code) return '`' + text + '`'
      return text
    })
    .join('')
}

// ─────────────────────────────────────────────────────────────
// Data Source ID 조회 (v2025-09-03+ 대응)
// ─────────────────────────────────────────────────────────────
async function resolveDataSourceId(databaseId: string): Promise<string> {
  try {
    const dbResponse: any = await notion.databases.retrieve({
      database_id: databaseId,
    })
    if (dbResponse.data_sources && dbResponse.data_sources.length > 0) {
      return dbResponse.data_sources[0].id
    }
    return databaseId
  } catch (err: any) {
    console.error(`❌ 데이터베이스 조회 실패 (${databaseId}):`, err.message)
    throw err
  }
}

// ─────────────────────────────────────────────────────────────
// ARTICLES fetch
// ─────────────────────────────────────────────────────────────
async function fetchArticles(): Promise<Article[]> {
  if (!NOTION_DATABASE_ID) return []

  console.log('📰 Notion에서 기사 가져오는 중...')
  const dataSourceId = await resolveDataSourceId(NOTION_DATABASE_ID)

  let pages: any[] = []
  let cursor: string | undefined
  do {
    const response: any = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
      sorts: [{ property: 'PublishDate', direction: 'descending' }],
      start_cursor: cursor,
    })
    pages.push(...response.results)
    cursor = response.next_cursor ?? undefined
  } while (cursor)

  console.log(`  ✓ ${pages.length}개 발행된 기사 발견`)

  const articles: Article[] = []
  for (const page of pages) {
    if (!isFullPage(page)) continue
    const props = page.properties as any
    const slug = getRichText(props.Slug)
    if (!slug) continue

    const category = normalizeCategoryString(getSelect(props.Category))

    console.log(`    📄 ${getTitle(props.Title)} [${category}]`)

    let body = ''
    try {
      body = await getPageBody(page.id)
    } catch (err: any) {
      console.warn(`      ⚠️  본문 실패: ${err.message}`)
    }

    articles.push({
      id: page.id,
      slug,
      category,
      title: getTitle(props.Title),
      dek: getRichText(props.Dek),
      readTime: getNumber(props.ReadTime) || 5,
      published: getDate(props.PublishDate),
      author: getRichText(props.Author) || 'AMATOR EDITORS',
      heroQuote: getRichText(props.HeroQuote) || undefined,
      youtube: getRichText(props.YouTube) || undefined,
      thumbnailColor: getRichText(props.ThumbColor) || undefined,
      featuredOn: getMultiSelect(props.FeaturedOn),
      body,
    })
  }

  return articles
}

// ─────────────────────────────────────────────────────────────
// PRODUCTS fetch
// ─────────────────────────────────────────────────────────────
async function fetchProducts(): Promise<Product[]> {
  if (!NOTION_PRODUCTS_DATABASE_ID) {
    console.log('ℹ️  NOTION_PRODUCTS_DATABASE_ID 없음. 상품 fetch 스킵.')
    return []
  }

  console.log('🛍  Notion에서 상품 가져오는 중...')
  const dataSourceId = await resolveDataSourceId(NOTION_PRODUCTS_DATABASE_ID)

  let pages: any[] = []
  let cursor: string | undefined
  do {
    const response: any = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: 'Active',
        checkbox: { equals: true },
      },
      start_cursor: cursor,
    })
    pages.push(...response.results)
    cursor = response.next_cursor ?? undefined
  } while (cursor)

  console.log(`  ✓ ${pages.length}개 상품 발견`)

  const products: Product[] = []
  for (const page of pages) {
    if (!isFullPage(page)) continue
    const props = page.properties as any
    const slug = getRichText(props.Slug)
    if (!slug) continue

    const category = normalizeCategoryString(getSelect(props.Category))

    console.log(`    🏷  ${getTitle(props.Name)} [${category}]`)

    products.push({
      id: page.id,
      slug,
      name: getTitle(props.Name),
      brand: getRichText(props.Brand) || 'UNKNOWN',
      category,
      price: getNumber(props.Price),
      originalPrice: getNumber(props.OriginalPrice) || undefined,
      image: getFileURL(props.Image),
      thumbnailColor: getRichText(props.ThumbColor) || undefined,
      dek: getRichText(props.Dek),
      description: getRichText(props.Description) || undefined,
      affiliateURL: getURL(props.AffiliateURL),
      vendor: getSelect(props.Vendor) || 'COUPANG',
      featured: getCheckbox(props.Featured),
      relatedArticleSlug: getRichText(props.RelatedArticleSlug) || undefined,
    })
  }

  return products
}

// ─────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────
async function main() {
  const outputDir = dirname(ARTICLES_OUTPUT)
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  try {
    const articles = await fetchArticles()
    if (articles.length > 0) {
      writeFileSync(
        ARTICLES_OUTPUT,
        JSON.stringify(articles, null, 2),
        'utf-8',
      )
      console.log(`✅ ${articles.length}개 기사 저장: ${ARTICLES_OUTPUT}`)
    } else {
      console.log('ℹ️  새 기사 없음. 기존 articles.json 유지.')
    }
  } catch (err: any) {
    console.error('❌ 기사 fetch 에러:', err.message)
    console.log('ℹ️  기존 articles.json 폴백 유지.')
  }

  try {
    const products = await fetchProducts()
    if (products.length > 0) {
      writeFileSync(
        PRODUCTS_OUTPUT,
        JSON.stringify(products, null, 2),
        'utf-8',
      )
      console.log(`✅ ${products.length}개 상품 저장: ${PRODUCTS_OUTPUT}`)
    } else {
      console.log('ℹ️  새 상품 없음. 기존 products.json 유지.')
    }
  } catch (err: any) {
    console.error('❌ 상품 fetch 에러:', err.message)
    console.log('ℹ️  기존 products.json 폴백 유지.')
  }
}

main().catch((err) => {
  console.error('❌ 예상치 못한 에러:', err)
  process.exit(0) // 빌드 계속 진행
})
