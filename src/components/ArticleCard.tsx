import { Link } from 'react-router-dom'
import type { Article } from '../content/articles'
import { CATEGORY_LABELS, CATEGORY_SHORT_LABELS } from '../content/articles'

interface Props {
  article: Article
  variant?: 'default' | 'compact'
}

/**
 * ArticleCard — 디에딧/Wirecutter 패턴
 *
 * 모바일(<md): 이미지 좌(1/3 aspect-square) + 텍스트 우(2/3) 가로 레이아웃
 * 데스크탑(md+): 이미지 위(aspect-square) + 텍스트 아래 세로 레이아웃
 *
 * variant='compact' — 텍스트 only (점선 위, ArticleListWithDividers 호환용 보존)
 */
export function ArticleCard({ article, variant = 'default' }: Props) {
  if (variant === 'compact') {
    // 텍스트 only — 점선 + 카테고리 라벨 + 제목 + 메타
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

  // 디에딧 패턴 (default)
  return (
    <Link to={`/a/${article.slug}`} className="group block lift">
      <div className="flex gap-4 md:flex-col md:gap-0">
        {/* 이미지 — 모바일 1/3 너비 / 데스크탑 풀 너비, 둘 다 1:1 */}
        <div
          className="aspect-square w-1/3 md:w-full md:mb-4 overflow-hidden flex-shrink-0"
          style={{ backgroundColor: article.thumbnailColor ?? 'var(--sr-paper)' }}
        >
          {article.heroImage && (
            <img
              src={article.heroImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
        </div>

        {/* 텍스트 영역 */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-signal mb-1 md:mb-2">
            {CATEGORY_SHORT_LABELS[article.category]}
          </div>
          <h3
            className="font-bold leading-tight text-base md:text-xl text-ink-900 group-hover:opacity-70 transition line-clamp-2"
            style={{ fontFamily: 'var(--font-serif-kr)' }}
          >
            {article.title}
          </h3>
          {article.dek && (
            <p className="text-sm text-ink-500 mt-2 leading-snug line-clamp-2 md:line-clamp-3">
              {article.dek}
            </p>
          )}
          <div className="text-xs text-ink-500 mt-2 md:mt-3 typewriter">
            {formatDate(article.published)}
          </div>
        </div>
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
