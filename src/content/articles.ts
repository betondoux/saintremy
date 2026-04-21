// src/content/articles.ts
//
// 빌드 타임에 Notion에서 가져온 generated/articles.json을 로드.
// Notion 미연결 시 폴백 데이터 사용.

import articlesData from '../generated/articles.json'

export type Category = 'lift' | 'combat' | 'football' | 'run' | 'flow' | 'court'

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

interface CategoryMeta {
  title: string
  subtitle: string
  icon: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  lift: 'LIFT',
  combat: 'COMBAT',
  football: 'FOOTBALL',
  run: 'RUN',
  flow: 'FLOW',
  court: 'COURT',
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  lift: {
    title: 'Lift',
    subtitle: '힘의 과학. 근육이 뇌에 주는 신호, 관절이 견디는 한계.',
    icon: '💪',
  },
  combat: {
    title: 'Combat',
    subtitle: 'BJJ, 복싱, MMA. 몸으로 배우는 침착함의 기술.',
    icon: '🥋',
  },
  football: {
    title: 'Football',
    subtitle: '조기축구에서 EPL까지. 공을 차는 일의 오래된 가치.',
    icon: '⚽',
  },
  run: {
    title: 'Run',
    subtitle: '거리와 시간, 그리고 고독. 달리는 사람의 세계.',
    icon: '🏃',
  },
  flow: {
    title: 'Flow',
    subtitle: '요가와 필라테스. 매트 위에서 배우는 느린 호흡의 강함.',
    icon: '🧘',
  },
  court: {
    title: 'Court',
    subtitle: '테니스와 배드민턴. 함께 랠리를 주고받는 사람들의 운동.',
    icon: '🎾',
  },
}

// ─────────────────────────────────────────────────────────────
// Notion 데이터를 AMATOR 브랜드 톤에 맞게 정제
// 1. 저자를 "AMATOR Editors"로 통일 (개인 이름 제거)
// 2. 성별 특정 표현을 중립어로 일괄 치환
// ─────────────────────────────────────────────────────────────
const neutralize = (text: string | undefined): string =>
  (text ?? '')
    .replace(/한국 남성/g, '한국인')
    .replace(/중년 남성/g, '중년')
    .replace(/40대 남성/g, '40대')
    .replace(/30대 남성/g, '30대')
    .replace(/50대 남성/g, '50대')

export const articles: Article[] = (articlesData as unknown as Article[]).map(
  (article) => ({
    ...article,
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