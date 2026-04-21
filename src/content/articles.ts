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

export const CATEGORY_LABELS: Record<Category, string> = {
  lift: 'LIFT',
  combat: 'COMBAT',
  football: 'FOOTBALL',
  run: 'RUN',
  flow: 'FLOW',
  court: 'COURT',
}

export const CATEGORY_META: Record<
  Category,
  { title: string; subtitle: string; icon: string }
> = {
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

export const articles: Article[] = articlesData as unknown as Article[]

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
  // Note: 현재 "films" 카테고리가 제거되었고, RUN 안에 Breaking2 같은 영상 기사가 있음.
  // FeaturedOn = "FilmOfTheWeek" 로 명시된 기사만 반환.
  return articles.find((a) => a.featuredOn?.includes('FilmOfTheWeek'))
}

export function getMostReadArticles(): Article[] {
  return articles
    .filter((a) => a.featuredOn?.includes('MostRead'))
    .slice(0, 5)
}

/**
 * Dek(부제)을 문장 단위로 쪼개서 줄바꿈용 배열로 반환.
 * 에디토리얼 매거진 스타일: 각 문장이 독립된 줄로 렌더링되도록.
 *
 * 예시:
 *   "영국의 19만 명을 추적했다. 중년 악력이 중요했다."
 *   → ["영국의 19만 명을 추적했다.", "중년 악력이 중요했다."]
 *
 * 주의: 약어 뒤의 마침표(예: "U.S.")는 분리하지 않도록 단순 처리.
 * 한국어 기사는 약어 마침표가 거의 없어 안전.
 */
export function splitDekIntoSentences(dek: string): string[] {
  if (!dek) return []
  // 마침표/물음표/느낌표 + 공백 패턴으로 분리
  // 숫자 사이의 소수점(예: 9.7)은 보존
  const sentences = dek
    .split(/(?<=[.!?])\s+(?=[가-힣A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
  return sentences
}
