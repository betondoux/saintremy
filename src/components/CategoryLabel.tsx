// src/components/CategoryLabel.tsx
// 카테고리별 2px 컬러 라인이 달린 라벨. 모든 섹션/기사 제목 위에 사용.

import type { Category } from '../content/articles'

const CATEGORY_COLORS: Record<Category, string> = {
  gift:      'var(--cat-gift)',
  deal:      'var(--cat-deal)',
  style:     'var(--cat-style)',
  beauty:    'var(--cat-beauty)',
  space:     'var(--cat-space)',
  kitchen:   'var(--cat-kitchen)',
  move:      'var(--cat-move)',
  travel:    'var(--cat-travel)',
  furniture: 'var(--cat-furn)',
  living:    'var(--cat-living)',
  music:     'var(--cat-music)',
}

const CATEGORY_EN_KR: Record<Category, { en: string; kr: string }> = {
  gift:      { en: 'GIFT',      kr: '선물' },
  deal:      { en: 'DEAL',      kr: '할인' },
  style:     { en: 'STYLE',     kr: '스타일' },
  beauty:    { en: 'BEAUTY',    kr: '뷰티' },
  space:     { en: 'SPACE',     kr: '공간' },
  kitchen:   { en: 'KITCHEN',   kr: '주방' },
  move:      { en: 'MOVE',      kr: '운동' },
  travel:    { en: 'TRAVEL',    kr: '여행' },
  furniture: { en: 'FURNITURE', kr: '가구' },
  living:    { en: 'LIVING',    kr: '생활' },
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
