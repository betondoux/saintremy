import { Link } from 'react-router-dom'
import type { Article } from '../content/articles'
import { CATEGORY_LABELS } from '../content/articles'
import { Dek } from './Dek'

interface Props {
  article: Article
  variant?: 'default' | 'compact'
}

export function ArticleCard({ article, variant = 'default' }: Props) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/a/${article.slug}`}
        className="group block py-4 border-t border-dashed border-ink-900/25 lift"
      >
        <div className="typewriter-label text-signal mb-2">
          {CATEGORY_LABELS[article.category]}
        </div>
        <h3 className="headline text-xl md:text-2xl text-ink-900 group-hover:text-signal transition leading-tight">
          {article.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 typewriter text-ink-500">
          <span>{formatDate(article.published)}</span>
          <span className="opacity-40">·</span>
          <span>{article.readTime}분 읽기</span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/a/${article.slug}`}
      className="group block border-t border-dashed border-ink-900/25 pt-6 pb-2 lift"
    >
      <div className="typewriter-label text-signal mb-3">
        {CATEGORY_LABELS[article.category]}
      </div>
      <h3 className="headline-italic text-2xl md:text-3xl text-ink-900 group-hover:text-signal transition leading-tight">
        {article.title}
      </h3>
      <Dek
        text={article.dek}
        className="body-text text-ink-500 mt-3 text-sm md:text-base"
      />
      <div className="flex items-center gap-3 mt-4 typewriter text-ink-500">
        <span>{formatDate(article.published)}</span>
        <span className="opacity-40">·</span>
        <span>{article.readTime}분 읽기</span>
      </div>
    </Link>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}
