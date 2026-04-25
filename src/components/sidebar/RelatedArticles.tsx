// src/components/sidebar/RelatedArticles.tsx
// 사이드바 "함께 읽기" — frontmatter.related 의 slug/id 배열을 받아 최대 3개 렌더.

import { Link } from 'react-router-dom'
import { articles, CATEGORY_LABELS } from '../../content/articles'

export default function RelatedArticles({ ids }: { ids: string[] }) {
  const picks = ids
    .map((id) => articles.find((a) => a.slug === id || a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .slice(0, 3)

  if (picks.length === 0) return null

  return (
    <aside className="pt-6 border-t" style={{ borderColor: '#E5E0D6' }}>
      <div
        className="font-bold mb-4"
        style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: '#0A0A0B',
        }}
      >
        함께 읽기
      </div>
      <ul className="space-y-5">
        {picks.map((a) => (
          <li key={a.slug}>
            <Link
              to={`/a/${a.slug}`}
              className="block group"
            >
              <div
                className="uppercase mb-1"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  color: '#8A8580',
                }}
              >
                {a.categoryLabel ?? CATEGORY_LABELS[a.category]}
              </div>
              <div
                className="font-serif leading-snug group-hover:underline"
                style={{ fontSize: '16px', color: '#0A0A0B' }}
              >
                {a.title}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
