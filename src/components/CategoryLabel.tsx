// src/components/CategoryLabel.tsx
// 카테고리별 2px 컬러 라인이 달린 라벨. 모든 섹션/기사 제목 위에 사용.

import type { Category } from '../content/articles'

const CATEGORY_COLORS: Record<Category, string> = {
  deals:      'var(--cat-gift)',
  style:     'var(--cat-style)',
  space:     'var(--cat-space)',
  home:   'var(--cat-kitchen)',
  travel:    'var(--cat-travel)',
  music:     'var(--cat-music)',
}

const CATEGORY_EN_KR: Record<Category, { en: string; kr: string }> = {
  deals:      { en: 'GIFT',      kr: '선물' },
  style:     { en: 'STYLE',     kr: '스타일' },
  space:     { en: 'SPACE',     kr: '공간' },
  home:   { en: 'KITCHEN',   kr: '주방' },
  travel:    { en: 'TRAVEL',    kr: '여행' },
  music:     { en: 'MUSIC',     kr: '음악' },
}

type Props = {
  category: Category
  align?: 'left' | 'center'
}

export default function CategoryLabel({ category, align = 'left' }: Props) {
  const color = CATEGORY_COLORS[category]
  const { en, kr } = CATEGORY_EN_KR[category]

  return (
    <div
      className={`inline-flex flex-col ${align === 'center' ? 'items-center' : 'items-start'}`}
      style={{ color }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          fontWeight: 500,
          letterSpacing: '0.2em',
        }}
      >
        {en} ({kr})
      </span>
      <div
        style={{
          width: '48px',
          height: 'var(--rule-accent)',
          backgroundColor: color,
          marginTop: '6px',
        }}
      />
    </div>
  )
}

export { CATEGORY_COLORS, CATEGORY_EN_KR }
