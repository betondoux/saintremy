// src/content/articles.ts
//
// 빌드 타임에 Notion에서 가져온 generated/articles.json을 로드.
// 10개 한국어 카테고리로 확장 (선물/할인/스타일/뷰티/공간/주방/운동/여행/가구/생활).
// 기존 6개 스포츠 카테고리(lift/combat/football/run/flow/court)는 '운동'으로 자동 통합.

import articlesData from '../generated/articles.json'

// 10개 카테고리 (URL slug 기준 영문)
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
  featuredOn?: string[]
}

// 한국어 카테고리 라벨 (UI 표시용)
export const CATEGORY_LABELS: Record<Category, string> = {
  gift: '선물',
  deal: '할인',
  style: '스타일',
  beauty: '뷰티',
  space: '공간',
  kitchen: '주방',
  move: '운동',
  travel: '여행',
  furniture: '가구',
  living: '생활',
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
}

// 모든 유효한 카테고리 (타입 가드용)
export const ALL_CATEGORIES: Category[] = [
  'gift',
  'deal',
  'style',
  'beauty',
  'space',
  'kitchen',
  'move',
  'travel',
  'furniture',
  'living',
]

// ─────────────────────────────────────────────────────────────
// Notion 데이터 정제
// 1. 저자를 "AMATOR Editors"로 통일
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
    author: 'AMATOR Editors',
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
  const featured = articles.find((a) => a.featuredOn?.includes('Hero'))
  return featured ?? getLatestArticle()
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