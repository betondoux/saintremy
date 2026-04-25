// src/content/articles.ts
//
// 빌드 타임에 Notion에서 가져온 generated/articles.json을 로드.
// 11개 한국어 카테고리 (선물/할인/스타일/뷰티/공간/주방/운동/여행/가구/생활/음악).
// 기존 6개 스포츠 카테고리(lift/combat/football/run/flow/court)는 '운동'으로 자동 통합.

import articlesData from '../generated/articles.json'

// 11개 카테고리 (URL slug 기준 영문)
export type Category =
  | 'gift'
  | 'deal'
  | 'style'
  | 'beauty'
  | 'space'
  | 'kitchen'
  | 'move'
  | 'travel'
  | 'furniture'
  | 'living'
  | 'music'
  | 'desk'

// 기존 6개 스포츠 카테고리 타입 (Notion 데이터 호환용)
type LegacySportCategory =
  | 'lift'
  | 'combat'
  | 'football'
  | 'run'
  | 'flow'
  | 'court'

// 기존 6개 → 'move'로 매핑 (레거시 호환)
const LEGACY_TO_MOVE: Record<LegacySportCategory, Category> = {
  lift: 'move',
  combat: 'move',
  football: 'move',
  run: 'move',
  flow: 'move',
  court: 'move',
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
  // 제품
  productName: string
  productImage: string // 쿠팡/올리브영 상품 메인 이미지 URL 그대로
  productImageAlt: string
  // 가격 — "29,000원" 또는 "From 29,000원" 같이 자유 문자열
  price: string
  // 본문 — 제품 추천 카피 1~2 문단 (마크다운 인라인 OK)
  body: string
  // 머천트 + CTA
  merchant: 'coupang' | 'oliveyoung'
  productUrl: string
  ctaLabel?: string // 미지정 시 "쿠팡에서 보기 →" / "올리브영에서 보기 →" 자동
  // 옵션: 노란 형광 스티커 ("진짜 좋은 가격!", "에디터 추천" 등)
  badge?: string
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
  gift: 'Gift (선물)',
  deal: 'Deal (할인)',
  style: 'Style (스타일)',
  beauty: 'Beauty (뷰티)',
  space: 'Space (공간)',
  kitchen: 'Kitchen (주방)',
  move: 'Move (운동)',
  travel: 'Travel (여행)',
  furniture: 'Furniture (가구)',
  living: 'Living (생활)',
  music: 'Music (음악)',
  desk: 'Desk (책상)',
}

// 데스크탑 네비 전용 — 공간이 좁아 영문 단축 표기.
export const CATEGORY_SHORT_LABELS: Record<Category, string> = {
  gift: 'Gift',
  deal: 'Deal',
  style: 'Style',
  beauty: 'Beauty',
  space: 'Space',
  kitchen: 'Kitchen',
  move: 'Move',
  travel: 'Travel',
  furniture: 'Furniture',
  living: 'Living',
  music: 'Music',
  desk: 'Desk',
}

// 카테고리 메타 정보 (서브타이틀, 아이콘)
export const CATEGORY_META: Record<
  Category,
  { title: string; subtitle: string; icon: string }
> = {
  gift: {
    title: '선물',
    subtitle: '실패하지 않는 선물의 기준.',
    icon: '🎁',
  },
  deal: {
    title: '할인',
    subtitle: '놓치면 아쉬운 이번 주 할인.',
    icon: '🏷️',
  },
  style: {
    title: '스타일',
    subtitle: '덜 사고 더 잘 입는 법.',
    icon: '👗',
  },
  beauty: {
    title: '뷰티',
    subtitle: '허세 없는 피부와 화장품 이야기.',
    icon: '💄',
  },
  space: {
    title: '공간',
    subtitle: '좁아도 답답하지 않은 공간의 원칙.',
    icon: '🏠',
  },
  kitchen: {
    title: '주방',
    subtitle: '요리를 바꾸는 도구들.',
    icon: '🍳',
  },
  move: {
    title: '운동',
    subtitle: '근력부터 요가까지, 몸을 쓰는 모든 방식.',
    icon: '💪',
  },
  travel: {
    title: '여행',
    subtitle: '짐은 가볍게, 경험은 무겁게.',
    icon: '✈️',
  },
  furniture: {
    title: '가구',
    subtitle: '오래 쓰는 가구, 오래 살아남는 방의 조건.',
    icon: '🪑',
  },
  living: {
    title: '생활',
    subtitle: '매일 쓰는 것들의 작은 차이.',
    icon: '🧺',
  },
  music: {
    title: '음악',
    subtitle: '귀로 머무는 시간을 위한 음반과 곡.',
    icon: '🎧',
  },
  desk: {
    title: '책상',
    subtitle: '재택근무자의 작업 공간을 만드는 도구들.',
    icon: '🖥️',
  },
}

// 모든 유효한 카테고리 (타입 가드용)
// 햄버거 메뉴 노출 순서: 콘텐츠 있는 카테고리(Deal/Gift/Beauty/Music/Style/Desk/Kitchen)
// 앞쪽 → Coming soon 카테고리(Space/Move/Travel/Furniture/Living) 뒤쪽.
export const ALL_CATEGORIES: Category[] = [
  'deal',
  'gift',
  'beauty',
  'music',
  'style',
  'desk',
  'kitchen',
  'space',
  'move',
  'travel',
  'furniture',
  'living',
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
  return 'living'
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

export function getAllArticles(): Article[] {
  return [...articles].sort((a, b) => b.published.localeCompare(a.published))
}

export function getLatestArticle(): Article | undefined {
  return getAllArticles()[0]
}

export function getHeroArticle(): Article | undefined {
  // 1순위 — THE DUEL 시리즈 기사 중 최신 것이 항상 hero.
  //   새 DUEL N°xxx 이 발행되면 자동으로 맨 위로 승격.
  const duels = articles
    .filter((a) => a.categoryLabel === 'THE DUEL')
    .sort((a, b) => b.published.localeCompare(a.published))
  if (duels.length > 0) return duels[0]

  // 2순위 — featuredOn: ["Hero"] 수동 뱃지
  const featured = articles.find((a) => a.featuredOn?.includes('Hero'))
  if (featured) return featured

  // 3순위 — 최신 기사 (fallback)
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
  gift: ['By Recipient', 'By Budget', 'By Occasion', "Editor's Pick"],
  deal: ['This Week', 'Under ₩30,000', 'Beauty Deals', 'Tech Deals'],
  style: ['Audio', 'Wearables', 'Bags', 'Outerwear'],
  beauty: ['Cleanser', 'Sunscreen', 'Skincare', 'Fragrance', 'Tools'],
  space: [],
  kitchen: ['Coffee + Tea', 'Cookware', 'Small Appliances', 'Knives'],
  move: [],
  travel: [],
  furniture: [],
  living: [],
  music: ['Headphones', 'Earphones', 'Speakers', 'Walkman + Players', "Editor's Picks"],
  desk: ['Lighting', 'Monitor + Stand', 'Keyboard + Mouse', 'Ergonomic Chair', 'Cable + Power'],
}

// 햄버거 메뉴 카테고리 라벨 색상 (The Strategist 스티커 패턴).
export const CATEGORY_STICKER_COLORS: Record<Category, string> = {
  gift: '#FF7A1A',      // orange — 활기
  deal: '#FFE600',      // yellow — 긴급/세일
  style: '#00C2D9',     // cyan — 테크/모던
  beauty: '#FF1F8F',    // hot pink — 관습적
  space: '#FFE600',     // yellow — 따뜻함
  kitchen: '#B845E8',   // purple — 미식
  move: '#2BC48A',      // green — 활력
  travel: '#FF7A1A',    // orange — 활기
  furniture: '#2BC48A', // green — 자연/오래감
  living: '#FF1F8F',    // hot pink — 일상
  music: '#7F77DD',     // purple — 감성/분위기
  desk: '#FFB800',      // amber — 데스크 램프
}
