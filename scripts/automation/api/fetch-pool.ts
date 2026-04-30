// 일별 후보 풀 빌더 — 전체 카테고리 + 골드박스를 fetch해 JSON으로 캐시

import fs from 'node:fs'
import path from 'node:path'
import { fetchBestCategory, fetchGoldbox, type CoupangProduct } from './coupang-client.js'
import { COUPANG_CATEGORIES, SAINTREMY_TO_COUPANG, type SaintremyCategory } from './category-map.js'

function loadDotenv() {
  const p = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
}

export interface CandidateRecord extends CoupangProduct {
  source: 'goldbox' | 'bestcategory'
  fetchedAt: string
  saintremyCategory?: SaintremyCategory
  coupangCategoryId?: number
  coupangCategoryLabel?: string
}

export interface CandidatePool {
  date: string                      // YYYY-MM-DD KST
  fetchedAt: string                 // ISO timestamp
  totalCount: number
  byCategory: Record<string, CandidateRecord[]>
  byGoldbox: CandidateRecord[]
}

function todayKstISO(): string {
  // KST = UTC+9
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

async function fetchAllCategories(perCategoryLimit = 50): Promise<Record<string, CandidateRecord[]>> {
  const categories = Object.entries(COUPANG_CATEGORIES)
  const result: Record<string, CandidateRecord[]> = {}
  const fetchedAt = new Date().toISOString()
  for (const [key, spec] of categories) {
    try {
      const products = await fetchBestCategory(spec.id, perCategoryLimit)
      result[key] = products.map((p) => ({
        ...p,
        source: 'bestcategory' as const,
        fetchedAt,
        coupangCategoryId: spec.id,
        coupangCategoryLabel: spec.label,
      }))
      console.log(`✓ ${key} (${spec.id} ${spec.label}): ${products.length}`)
      // rate limit 보호
      await new Promise((r) => setTimeout(r, 250))
    } catch (e) {
      console.error(`✗ ${key} (${spec.id}):`, (e as Error).message)
      result[key] = []
    }
  }
  return result
}

function mapToSaintremyCategory(coupangCategoryId: number): SaintremyCategory | undefined {
  for (const [sCat, cIds] of Object.entries(SAINTREMY_TO_COUPANG) as Array<[SaintremyCategory, number[]]>) {
    if (cIds.includes(coupangCategoryId)) return sCat
  }
  return undefined
}

export async function buildCandidatePool(): Promise<CandidatePool> {
  loadDotenv()
  console.log('=== Saint-Rémy Candidate Pool Builder ===')
  console.log('[1/2] 골드박스 fetch …')
  const goldbox = await fetchGoldbox()
  const byGoldbox: CandidateRecord[] = goldbox.map((p) => ({
    ...p,
    source: 'goldbox' as const,
    fetchedAt: new Date().toISOString(),
  }))
  console.log(`✓ goldbox ${byGoldbox.length} 상품`)

  console.log('[2/2] 카테고리별 베스트 fetch …')
  const byCategory = await fetchAllCategories()
  for (const records of Object.values(byCategory)) {
    for (const r of records) {
      if (r.coupangCategoryId) {
        r.saintremyCategory = mapToSaintremyCategory(r.coupangCategoryId)
      }
    }
  }

  const totalCount = byGoldbox.length + Object.values(byCategory).reduce((s, arr) => s + arr.length, 0)
  const pool: CandidatePool = {
    date: todayKstISO(),
    fetchedAt: new Date().toISOString(),
    totalCount,
    byCategory,
    byGoldbox,
  }

  const outDir = path.resolve(process.cwd(), 'data/automation/candidates')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `${pool.date}.json`)
  fs.writeFileSync(outPath, JSON.stringify(pool, null, 2))
  console.log(`\n💾 saved → ${outPath}`)
  console.log(`총 ${pool.totalCount} 상품 수집`)
  return pool
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  buildCandidatePool().catch((e) => {
    console.error('✗', e.message)
    process.exit(1)
  })
}
