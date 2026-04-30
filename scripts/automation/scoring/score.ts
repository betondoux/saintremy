// 후보 풀 → 카테고리별 상위 픽 스코어링
//
// 쿠팡 API 응답 한계상 정가/평점/누적건수가 없어서 사용 가능한 신호:
// - rank (베스트 카테고리 순위)
// - isRocket (로켓배송 = 검증된 셀러)
// - isFreeShipping
// - productPrice (적정 가격대)

import fs from 'node:fs'
import path from 'node:path'
import type { CandidatePool, CandidateRecord } from '../api/fetch-pool.js'
import type { SaintremyCategory } from '../api/category-map.js'

export interface ScoredCandidate extends CandidateRecord {
  score: number
  scoreBreakdown: Record<string, number>
}

// 카테고리별 적정 가격대 (KRW) — 너무 비싸거나 싸면 매거진 톤에 부적합
const PRICE_BANDS: Partial<Record<SaintremyCategory, [number, number]>> = {
  beauty:    [5_000, 80_000],
  kitchen:   [10_000, 200_000],
  living:    [5_000, 100_000],
  furniture: [50_000, 500_000],
  style:     [20_000, 200_000],
  move:      [10_000, 300_000],
  travel:    [50_000, 1_000_000],
  space:     [10_000, 200_000],
  gift:      [20_000, 200_000],
  music:     [50_000, 500_000],
}

function scorePrice(price: number, band?: [number, number]): number {
  if (!band) return 0.5
  const [lo, hi] = band
  if (price < lo) return 0.3 + (price / lo) * 0.4
  if (price > hi) return Math.max(0, 1 - (price - hi) / hi)
  return 1.0
}

function scoreRank(rank?: number): number {
  if (!rank) return 0.3
  if (rank <= 5) return 1.0
  if (rank <= 10) return 0.85
  if (rank <= 20) return 0.65
  if (rank <= 30) return 0.45
  return 0.25
}

export function scoreCandidate(c: CandidateRecord, sCat?: SaintremyCategory): ScoredCandidate {
  const breakdown = {
    rank:         scoreRank(c.rank),
    rocket:       c.isRocket ? 1.0 : 0.4,
    freeShipping: c.isFreeShipping ? 1.0 : 0.6,
    price:        scorePrice(c.productPrice, sCat ? PRICE_BANDS[sCat] : undefined),
  }
  // 가중치 — rank 35%, rocket 25%, price 25%, freeShipping 15%
  const score =
    0.35 * breakdown.rank +
    0.25 * breakdown.rocket +
    0.15 * breakdown.freeShipping +
    0.25 * breakdown.price
  return { ...c, score, scoreBreakdown: breakdown }
}

export interface CategoryPick {
  saintremyCategory: SaintremyCategory
  topPicks: ScoredCandidate[]
  rationale: string
}

export function pickByCategory(
  pool: CandidatePool,
  saintremyCategory: SaintremyCategory,
  topN = 5,
): CategoryPick {
  const allRecords = Object.values(pool.byCategory).flat()
  const filtered = allRecords.filter((r) => r.saintremyCategory === saintremyCategory)
  const scored = filtered
    .map((c) => scoreCandidate(c, saintremyCategory))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
  return {
    saintremyCategory,
    topPicks: scored,
    rationale: `${saintremyCategory} 카테고리에서 rank·rocket·price·shipping 가중 점수 상위 ${topN}`,
  }
}

export function loadLatestPool(): CandidatePool {
  const dir = path.resolve(process.cwd(), 'data/automation/candidates')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().reverse()
  if (!files.length) throw new Error('후보 풀 없음 — fetch-pool.ts 먼저 실행')
  return JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'))
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  const pool = loadLatestPool()
  const target = (process.argv[2] as SaintremyCategory) || 'beauty'
  const pick = pickByCategory(pool, target, 5)
  console.log(`\n=== ${target.toUpperCase()} TOP 5 ===\n`)
  pick.topPicks.forEach((p, i) => {
    console.log(`${i + 1}. [${p.score.toFixed(3)}] ${p.productName}`)
    console.log(`   ${p.productPrice.toLocaleString()}원 · rank ${p.rank} · ${p.isRocket ? '🚀' : ''}${p.isFreeShipping ? ' 무배' : ''}`)
    console.log(`   ${p.productUrl.slice(0, 70)}…`)
    console.log()
  })
}
