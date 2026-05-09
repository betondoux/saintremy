// src/content/articles.ts
//
// 빌드 타임에 Notion에서 가져온 generated/articles.json을 로드.
// 11개 한국어 카테고리 (선물/할인/스타일/뷰티/공간/주방/운동/여행/가구/생활/음악).
// 기존 6개 스포츠 카테고리(lift/combat/football/run/flow/court)는 '운동'으로 자동 통합.

import articlesData from '../generated/articles.json'

// 11개 카테고리 (URL slug 기준 영문)
export type Category =

  | 'style'
  | 'home'
  | 'space'
  | 'deals'
  | 'travel'
  | 'music'
  | 'story'// 기존 6개 스포츠 카테고리 타입 (Notion 데이터 호환용)
type LegacySportCategory =
  | 'lift'
  | 'combat'
  | 'football'
  | 'run'
  | 'flow'
  | 'court'

// 기존 6개 → 'move'로 매핑 (레거시 호환)
const LEGACY_TO_MOVE: Record<LegacySportCategory, Category> = {
  lift: 'space',
  combat: 'space',
  football: 'space',
  run: 'space',
  flow: 'space',
  court: 'space',
}

export interface Source {
  title: string
  author?: string
  publisher?: string
  year?: number
  url?: string
}

// 딜 레이더 형식 픽 카드용 — 쿠팡 어필리에이트 CTA 포함
export interface Pick {
  rank: number
  name: string
  category: string
  productImage: string
  productImageAlt: string
  originalPrice: number
  salePrice: number
  discountRate: number
  unitPrice?: string
  badges?: string[]
  monthlyBuyers?: string
  reviewCount?: number
  modelNumber?: string
  specs?: Record<string, string>
  deliveryDate?: string
  headline: string
  description: string
  pricePoint: string
  delivery: string
  benefit: string
  targetReader: string
  productUrl: string
  ctaLabel: string
  // The Strategist 스타일 RankBadge — 있으면 제품명 위에 뱃지 노출
  rankVariant?: 'overall' | 'budget' | 'splurge' | 'for' | 'also' | 'editor'
  rankLabel?: string
}

// The Strategist 스타일 사이드바 "Best Bet" 카드용
export interface HeroProduct {
  name: string
  image: string
  originalPrice?: number
  salePrice: number
  url: string
  merchant: 'coupang' | 'oliveyoung' | 'ohouse'
  discount?: number
}

export interface Intro {
  lead: string
  body: string
}

export interface Criteria {
  title: string
  items: string[]
  note?: string
}

export interface Outro {
  title: string
  body: string
  nextIssue?: string
}

// ─────────────────────────────────────────────────────────────
// THE DUEL — 제품 1:1 비교 시리즈 형식
// ─────────────────────────────────────────────────────────────
export interface DuelProduct {
  position: 'A' | 'B'
  brand: string
  name: string
  modelCode: string
  image: string
  listPrice: number
  salePrice?: number | null
  discountPercent?: number | null
  priceNote?: string
  priceCurrency?: string
  releaseDate: string
  productUrl: string
  ctaLabel: string
  keyFeatures: string[]
  bestFor: string
}

export interface ComparisonRow {
  label: string
  a: string
  b: string
}

export interface DuelRound {
  number: number
  title: string
  a: string
  b: string
  winner: string
  winnerNote?: string
}

export interface HonestLimits {
  a: string[]
  b: string[]
}

export interface FinalVerdictBlock {
  title: string
  items: string[]
}

export interface FinalVerdict {
  recommendA: FinalVerdictBlock
  recommendB: FinalVerdictBlock
  conclusion: string
}

// ─────────────────────────────────────────────────────────────
// ROUNDUP — The Strategist "Mother's Day Gifts" 식 다중 상품 가이드
// 한 기사에 제품 10~30개를 세로 스택. 할인율 없이 단순 가격 표시.
// 머천트는 쿠팡/올리브영만 (2026-04-25 확정).
// ─────────────────────────────────────────────────────────────
export interface RoundupItem {
  // 섹션 헤드라인 — 제품 위에 이탤릭으로 노출 ("엄마가 매일 쓸 핸드크림")
  sectionTitle: string
  /** 섹션 카테고리 소개 본문 (5-7줄, 메인 카드 위에 표시). 메인 카드에만 작성, 대안 카드는 비워둠 */
  sectionIntro?: string
  // 제품
  productName: string
  productImage: string // 쿠팡/올리브영 상품 메인 이미지 URL 그대로
  productImageAlt: string
  // 가격 — "29,000원" 또는 "From 29,000원" 같이 자유 문자열
  price: string
  /** 세일 시 정가 (취소선으로 표시). 예: "₩89,000" */
  originalPrice?: string
  /** 세일 시 할인율 표시 텍스트. 예: "11% off" */
  discountLabel?: string
  // 본문 — 제품 추천 카피 1~2 문단 (마크다운 인라인 OK)
  body: string
  // 머천트 + CTA
  merchant: 'coupang' | 'oliveyoung' | 'naver'
  productUrl: string
  ctaLabel?: string // 미지정 시 "쿠팡/올리브영/네이버에서 보기 →" 자동
  // 옵션: 노란 형광 스티커 ("진짜 좋은 가격!", "에디터 추천" 등)
  badge?: string
  /** 같은 섹션 안에서 메인이 아닌 대안 상품 (작은 가로 카드로 렌더) */
  isAlternate?: boolean
}

export interface Article {
  id?: string
  slug: string
  category: Category
  title: string
  dek: string
  readTime: number
  published: string
  author: string
  heroQuote?: string
  body: string
  sources?: Source[]
  youtube?: string
  thumbnailColor?: string
  heroImage?: string
  featuredOn?: string[]
  // 딜 레이더 형식 옵셔널 — picks 있으면 ArticlePage 가 PickCard 레이아웃 렌더
  affiliateDisclosure?: string
  intro?: Intro
  criteria?: Criteria
  picks?: Pick[]
  outro?: Outro
  footer?: string

  // THE DUEL 시리즈 옵셔널 — duelProducts 있으면 DuelLayout 렌더
  categoryLabel?: string
  issueNumber?: string
  heroImageMobile?: string
  ogImage?: string
  atGlance?: string
  duelProducts?: DuelProduct[]
  comparisonMatrix?: ComparisonRow[]
  rounds?: DuelRound[]
  honestLimits?: HonestLimits
  finalVerdict?: FinalVerdict
  editorNote?: string

  // The Strategist 레이아웃 — 사이드바 "Best Bet" 카드 + 본문 Gist + 관련 기사
  heroProduct?: HeroProduct
  gist?: string[]
  related?: string[]

  // ROUNDUP 형식 — roundup 있으면 ArticlePage 가 RoundupLayout 렌더
  // (intro/outro 는 PicksLayout 과 공유)
  roundup?: RoundupItem[]
}

// Bilingual 카테고리 라벨 — 모바일 네비/카드/뱃지/필터 공용
// 형식: "English (한글)" — UI가 너무 한글 일색이지 않도록.
export const CATEGORY_LABELS: Record<Category, string> = {
  style: 'Style (스타일)',
  home: 'Home (살림)',
  space: 'Space (공간)',
  deals: 'Deals (딜)',
  travel: 'Travel (여행)',
  music: 'Music (음악)',
  story: 'Story (인물)',
}

// 데스크탑 네비 전용 — 공간이 좁아 영문 단축 표기.
export const CATEGORY_SHORT_LABELS: Record<Category, string> = {
  style: 'Style',
  home: 'Home',
  space: 'Space',
  deals: 'Deals',
  travel: 'Travel',
  music: 'Music',
  story: 'Story',
}

// 카테고리 메타 정보 (서브타이틀, 아이콘)
export const CATEGORY_META: Record<
  Category,
  { title: string; subtitle: string; icon: string }
> = {
  style: { title: 'Style', subtitle: '취향과 일상의 도구', icon: '✦' },
  home: { title: 'Home', subtitle: '살림과 살림살이', icon: '❦' },
  space: { title: 'Space', subtitle: '머무는 공간의 결', icon: '❧' },
  deals: { title: 'Deals', subtitle: '이번 주 검증된 가격', icon: '✦' },
  travel: { title: 'Travel', subtitle: '여행과 도시의 기록', icon: '❦' },
  music: { title: 'Music', subtitle: '듣는 시간의 깊이', icon: '❧' },
  story: { title: 'Story', subtitle: '한 사람을 깊이 보는 매거진', icon: '✦' },
}

// 모든 유효한 카테고리 (타입 가드용)
// 햄버거 메뉴 노출 순서: 콘텐츠 있는 카테고리(Deal/Gift/Beauty/Music/Style/
// Furniture/Kitchen) 앞쪽 → Coming soon (Space/Move/Travel/Living) 뒤쪽.
// 2026-04-26: desk 카테고리 폐지 — 책상 관련 콘텐츠는 furniture로 통합.
export const ALL_CATEGORIES: Category[] = [
  'story',
  'style',
  'home',
  'space',
  'deals',
  'travel',
  'music',
]

// ─────────────────────────────────────────────────────────────
// Notion 데이터 정제
// 1. 저자를 "Saint-Rémy Editors"로 통일
// 2. 성별 특정 표현 중립어로 치환
// 3. 레거시 카테고리(lift/combat/etc) → 'move'로 자동 변환
// ─────────────────────────────────────────────────────────────
const neutralize = (text: string | undefined): string =>
  (text ?? '')
    .replace(/한국 남성/g, '한국인')
    .replace(/중년 남성/g, '중년')
    .replace(/40대 남성/g, '40대')
    .replace(/30대 남성/g, '30대')
    .replace(/50대 남성/g, '50대')

// 레거시 카테고리를 현재 카테고리로 변환
const normalizeCategory = (cat: string): Category => {
  if (cat in LEGACY_TO_MOVE) {
    return LEGACY_TO_MOVE[cat as LegacySportCategory]
  }
  if (ALL_CATEGORIES.includes(cat as Category)) {
    return cat as Category
  }
  // 미지의 카테고리는 일단 'living'으로 fallback (안전)
  return 'home'
}

type RawArticle = Omit<Article, 'category'> & { category: string }

export const articles: Article[] = (articlesData as unknown as RawArticle[]).map(
  (article) => ({
    ...article,
    category: normalizeCategory(article.category),
    author: 'Saint-Rémy Editors',
    title: neutralize(article.title),
    dek: neutralize(article.dek),
    body: neutralize(article.body),
  }),
)

// ─────────────────────────────────────────────────────────────
// Helper 함수들
// ─────────────────────────────────────────────────────────────

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getArticlesByCategory(category: Category): Article[] {
  return articles
    .filter((a) => a.category === category)
    .sort((a, b) => b.published.localeCompare(a.published))
}

// ─────────────────────────────────────────────────────────────
// 메인 페이지 카테고리 그리드 — 매일 다른 순서 (시드 + 가중치)
//
// 정책: "fresh window + evergreen rotate"
//   · 발행 후 N일 이내 글은 발행일 내림차순으로 상단 고정 (앵커)
//   · 그 외 evergreen 글은 일별 시드 셔플 (UTC dayOfYear + 카테고리)
//
// 효과:
//   · 같은 날 방문자는 모두 같은 순서 (소셜 공유 시 혼동 0, SEO·SSG 친화)
//   · 다음 날 evergreen 풀이 새 순서로 자동 회전 → 메인 화면 신선도
//   · 새 글은 무조건 노출 (셔플에 묻히지 않음)
// ─────────────────────────────────────────────────────────────
const FRESH_WINDOW_DAYS = 3

function dayOfYearUtc(): number {
  const now = new Date()
  const yearStart = Date.UTC(now.getUTCFullYear(), 0, 0)
  return Math.floor((now.getTime() - yearStart) / 86_400_000)
}

function mulberry32(seed: number): () => number {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed)
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getArticlesByCategoryRotated(category: Category): Article[] {
  const all = articles.filter((a) => a.category === category)
  if (all.length <= 1) return all

  const now = new Date()
  const cutoffDate = new Date(now.getTime() - FRESH_WINDOW_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10)

  const fresh = all
    .filter((a) => a.published >= cutoffDate)
    .sort((a, b) => b.published.localeCompare(a.published))
  const evergreen = all.filter((a) => a.published < cutoffDate)

  // 카테고리별로 다른 시드 — 같은 날에도 카테고리마다 다른 순서
  const seed = dayOfYearUtc() * 31 + category.charCodeAt(0)
  return [...fresh, ...seededShuffle(evergreen, seed)]
}

export function getAllArticles(): Article[] {
  return [...articles].sort((a, b) => b.published.localeCompare(a.published))
}

export function getLatestArticle(): Article | undefined {
  return getAllArticles()[0]
}

export function getHeroArticle(): Article | undefined {
  // Hero 풀: featuredOn: ["Hero"] 마커가 붙은 모든 글
  // - 풀 ≥ 2 → 8시간 블록 시드로 회전 (UTC 기준, 모든 방문자 동일 결과)
  // - 풀 = 1 → 그대로 고정
  // - 풀 = 0 → DUEL 자동 핀 → 최신 기사 순 fallback
  const heroPool = articles
    .filter((a) => a.featuredOn?.includes('Hero'))
    .sort((a, b) => b.published.localeCompare(a.published))

  if (heroPool.length > 1) {
    const now = new Date()
    const eightHourBlock = Math.floor(now.getUTCHours() / 8) // 0, 1, 2
    const yearStart = Date.UTC(now.getUTCFullYear(), 0, 0)
    const dayOfYear = Math.floor((now.getTime() - yearStart) / 86_400_000)
    const index = (dayOfYear * 3 + eightHourBlock) % heroPool.length
    return heroPool[index]
  }
  if (heroPool.length === 1) return heroPool[0]

  const duels = articles
    .filter((a) => a.categoryLabel === 'THE DUEL')
    .sort((a, b) => b.published.localeCompare(a.published))
  if (duels.length > 0) return duels[0]

  return getLatestArticle()
}

/**
 * Editor's Pick — 히어로 아래 슬롯.
 *
 * 전략: "Anchor + Rotate" (3편 매거진 대상).
 * - hero 는 고정 (DUEL pin) → 브랜드 앵커
 * - editor's pick 은 4시간 블록 단위로 교체 → 신선도 + 재방문 참여
 *
 * 시드 공식: dayOfYear * 6 + hourBlock (0~5)
 *   · 같은 시간대엔 모든 방문자 동일 (소셜 공유 시 혼동 없음)
 *   · 같은 방문자가 4시간 이내 재방문해도 안 바뀜 (앵커)
 *   · 4시간 지나면 자동 교체 (신선도)
 *   · UTC 기준 → 쿠키/localStorage 0 (개인정보 0)
 */
export function getEditorsPick(excludeSlug?: string): Article | undefined {
  const pool = articles
    .filter((a) => a.slug !== excludeSlug)
    .sort((a, b) => b.published.localeCompare(a.published))
  if (pool.length === 0) return undefined
  if (pool.length === 1) return pool[0]

  const now = new Date()
  const hourBlock = Math.floor(now.getUTCHours() / 4) // 0~5
  const yearStart = Date.UTC(now.getUTCFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - yearStart) / 86_400_000)
  const index = (dayOfYear * 6 + hourBlock) % pool.length
  return pool[index]
}

export function getFilmOfTheWeek(): Article | undefined {
  return articles.find((a) => a.featuredOn?.includes('FilmOfTheWeek'))
}

export function getMostReadArticles(): Article[] {
  return articles
    .filter((a) => a.featuredOn?.includes('MostRead'))
    .slice(0, 5)
}

export function splitDekIntoSentences(dek: string): string[] {
  if (!dek) return []
  const sentences = dek
    .split(/(?<=[.!?])\s+(?=[가-힣A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
  return sentences
}
// ═══════════════════════════════════════════════════════════════
// 2026-04-25 햄버거 메뉴 (The Strategist 스타일) 추가 데이터
// ═══════════════════════════════════════════════════════════════

// 햄버거 메뉴 서브카테고리 (영문 only).
// 빈 배열 = 메뉴에서 'Coming soon' 표시.
export const CATEGORY_SUBCATEGORIES: Record<Category, string[]> = {
  deals: ['By Recipient', 'By Budget', 'By Occasion', "Editor's Pick"],
  style: ['Audio', 'Wearables', 'Bags', 'Outerwear'],
  space: [],
  home: ['Coffee + Tea', 'Cookware', 'Small Appliances', 'Knives'],
  travel: [],
  music: ['Headphones', 'Earphones', 'Speakers', 'Walkman + Players', "Editor's Picks"],
  story: ['Chefs', 'Founders', 'Makers', 'Editors'],
}

// 햄버거 메뉴 카테고리 라벨 색상 (The Strategist 스티커 패턴).
export const CATEGORY_STICKER_COLORS: Record<Category, string> = {
  deals: '#FF7A1A',      // orange — 활기
  style: '#00C2D9',     // cyan — 테크/모던
  space: '#FFE600',     // yellow — 따뜻함
  home: '#B845E8',   // purple — 미식
  travel: '#FF7A1A',    // orange — 활기
  music: '#7F77DD',     // purple — 감성/분위기
  story: '#F2C14E',     // gold — 인물·서사
}
