/**
 * MagazineHero — ART PALMA / RUE PARIS 톤 매거진 헤더.
 * RITUAL·PEOPLE·MIND·GEAR 트랙 글 (slug.startsWith('ritual-' | 'people-' | ...))에 사용.
 * 거대 sans-serif 트랙명 + 흑백 hero 그리드 + 매거진 메타.
 */
import type { Article } from '../../content/articles'

interface Props {
  article: Article
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()
}

function trackName(article: Article): string {
  // series: "Saint-Rémy Ritual" → "RITUAL"
  const last = article.series?.split(/\s+/).pop()
  if (last) return last.toUpperCase()
  if (article.slug.startsWith('ritual-')) return 'RITUAL'
  if (article.slug.startsWith('people-')) return 'PEOPLE'
  if (article.slug.startsWith('mind-')) return 'MIND'
  if (article.slug.startsWith('gear-')) return 'GEAR'
  return 'STORY'
}

export default function MagazineHero({ article }: Props) {
  const track = trackName(article)
  const issue = article.issueNumber ?? ''
  const cat = article.categoryLabel ?? ''

  return (
    <div className="-mx-6 md:-mx-12 mb-16">
      {/* 상단 마스트헤드 */}
      <div
        className="flex justify-between items-center px-6 md:px-12 py-4 border-b border-ink-900/20 text-[0.65rem] md:text-xs uppercase tracking-[0.3em] text-ink-500"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span>{cat}</span>
        <span>SAINT-RÉMY · {issue}</span>
      </div>

      {/* 본 헤더 — 좌측 거대 트랙명 + 본문, 우측 흑백 hero */}
      <div className="grid md:grid-cols-12 gap-8 md:gap-12 px-6 md:px-12 pt-10 md:pt-16 pb-12">
        {/* 좌측 (7 cols) */}
        <div className="md:col-span-7 flex flex-col">
          <div
            className="text-[0.65rem] md:text-xs uppercase tracking-[0.32em] text-ink-500 mb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {track} · {issue}
          </div>

          {/* 거대 디스플레이 트랙명 */}
          <h2
            className="text-ink-900 leading-[0.82] font-black uppercase select-none"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: 'clamp(5.5rem, 14vw, 13rem)',
              letterSpacing: '-0.045em',
              fontWeight: 900,
            }}
          >
            {track}
          </h2>

          {/* 글 제목 */}
          <h1
            className="mt-10 md:mt-12 text-ink-900 text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.2]"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}
          >
            {article.title}
          </h1>

          {/* dek */}
          {article.dek && (
            <p
              className="mt-6 md:mt-7 text-ink-700 text-base md:text-lg leading-[1.55] max-w-xl"
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400 }}
            >
              {article.dek}
            </p>
          )}

          {/* 메타 */}
          <div
            className="mt-10 md:mt-12 flex items-center gap-4 text-[0.65rem] md:text-xs uppercase tracking-[0.3em] text-ink-500"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span>{article.author}</span>
            <span className="opacity-40">·</span>
            <span>{formatDate(article.published)}</span>
            {article.readTime && (
              <>
                <span className="opacity-40">·</span>
                <span>{article.readTime} MIN READ</span>
              </>
            )}
          </div>
        </div>

        {/* 우측 (5 cols) — 흑백 hero */}
        {article.heroImage && (
          <div className="md:col-span-5">
            <div className="w-full aspect-[3/4] overflow-hidden bg-ink-900/5">
              <img
                src={article.heroImage}
                alt={article.heroImageAlt ?? article.title}
                className="w-full h-full object-cover"
                style={{ filter: 'contrast(1.03)' }}
                loading="eager"
              />
            </div>
          </div>
        )}
      </div>

      {/* 하단 페이지 번호 + 카테고리 */}
      <div
        className="flex justify-between items-center px-6 md:px-12 py-4 border-t border-ink-900/20 text-[0.65rem] md:text-xs uppercase tracking-[0.3em] text-ink-500"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span>01 · SAINT-RÉMY</span>
        <span>{cat}</span>
      </div>
    </div>
  )
}
