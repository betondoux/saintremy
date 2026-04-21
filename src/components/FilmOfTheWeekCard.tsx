import { Link } from 'react-router-dom'
import type { Article } from '../content/articles'

interface Props {
  article: Article
}

/**
 * Film of the Week 카드
 * - 기사가 films 카테고리이고 youtube ID가 있을 때만 이 카드를 사용
 * - 원형 유튜브 썸네일 + 재생 버튼 + "THIS WEEK'S PICK"
 */
export function FilmOfTheWeekCard({ article }: Props) {
  return (
    <Link to={`/a/${article.slug}`} className="block group relative">
      {/* Yellow sticker */}
      <div className="absolute -top-3 -left-3 z-10 rotate-[-8deg] transform">
        <div
          className="bg-warming px-4 py-2 shadow-md"
          style={{ clipPath: 'polygon(0% 10%, 100% 0%, 95% 95%, 5% 100%)' }}
        >
          <div className="headline-italic text-ink-900 text-lg leading-tight">
            Film<br />
            of the Week
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          className="aspect-square rounded-full overflow-hidden flex items-end justify-center"
          style={{ backgroundColor: article.thumbnailColor ?? '#1A1D2C' }}
        >
          {article.youtube && (
            <img
              src={`https://i.ytimg.com/vi/${article.youtube}/hqdefault.jpg`}
              alt={article.title}
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition"
            />
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-cream-100/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <div
              className="w-0 h-0 ml-1"
              style={{
                borderLeft: '14px solid #0A0A0B',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
              }}
            />
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-cream-100 border border-ink-900 px-3 py-1">
          <span className="typewriter text-ink-900 text-xs font-medium">
            {article.readTime}MIN · WATCH
          </span>
        </div>
      </div>

      <div className="text-center mt-6">
        <div className="typewriter-label text-signal mb-2">
          THIS WEEK'S PICK
        </div>
        <h3 className="headline text-lg md:text-xl text-ink-900 group-hover:text-signal transition leading-tight px-2">
          {article.title}
        </h3>
        <p className="body-text text-ink-500 text-xs mt-2">
          {article.dek.length > 60
            ? article.dek.slice(0, 60) + '…'
            : article.dek}
        </p>
      </div>
    </Link>
  )
}
