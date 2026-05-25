/**
 * Home — 매거진 톤 (032c × 모던 이커머스).
 * HERO (RITUAL 최신) + LATEST 그리드 + ABOUT + MOST READ + Footer.
 * 화이트앤블랙, 거대 sans-serif, 흑백 사진, 라운드 박스.
 */
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import {
  getAllArticles,
  getHeroArticle,
  getMostReadArticles,
  type Article,
} from '../content/articles'

function pickFeaturedRitual(): Article | undefined {
  const all = getAllArticles()
  const rituals = all
    .filter((a) => a.slug.startsWith('ritual-'))
    .sort((a, b) => (b.seriesNumber ?? 0) - (a.seriesNumber ?? 0))
  return rituals[0] ?? getHeroArticle()
}

function formatDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()
}

function trackFromSlug(slug: string): string {
  const m = slug.match(/^(ritual|people|mind|gear)-/)
  return (m ? m[1] : 'STORY').toUpperCase()
}

function StoryCard({ article }: { article: Article }) {
  return (
    <Link to={`/a/${article.slug}`} className="group block">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-ink-900/[0.04] mb-4">
        {article.heroImage ? (
          <img
            src={article.heroImage}
            alt={article.heroImageAlt ?? article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ filter: 'grayscale(100%) contrast(1.05)' }}
            loading="lazy"
          />
        ) : null}
      </div>
      <div
        className="text-[0.6rem] uppercase tracking-[0.3em] text-ink-500 mb-2"
        style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
      >
        {trackFromSlug(article.slug)} {article.issueNumber ? `· ${article.issueNumber}` : ''}
      </div>
      <h3
        className="text-ink-900 leading-[1.2] group-hover:underline decoration-1 underline-offset-4"
        style={{
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
          letterSpacing: '-0.01em',
        }}
      >
        {article.title}
      </h3>
    </Link>
  )
}

export function Home() {
  const hero = pickFeaturedRitual()
  const all = getAllArticles()
  const latest = all
    .filter((a) => a.slug !== hero?.slug)
    .sort((a, b) => (b.published > a.published ? 1 : -1))
    .slice(0, 6)
  const popular = getMostReadArticles().slice(0, 3)

  const aboutPhotos = all
    .filter((a) => a.heroImage && a.slug !== hero?.slug)
    .slice(0, 2)

  return (
    <div className="bg-white text-ink-900">
      <SEO
        title="Saint-Rémy — Sports Culture Magazine"
        description="스포츠·문화·라이프스타일을 깊이 보는 매거진. 한 사람의 하루·동작·식단을 1차 자료로 따라간다."
      />

      {/* ───────────────────── HERO ───────────────────── */}
      <section className="px-5 md:px-10 pt-8 md:pt-12 pb-16 md:pb-20">
        <div
          className="text-[0.65rem] uppercase tracking-[0.32em] text-ink-500 mb-6 md:mb-10"
          style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
        >
          SAINT-RÉMY · SPORTS CULTURE MAGAZINE
        </div>

        <h1
          className="text-ink-900 leading-[0.82] uppercase select-none"
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(4.5rem, 22vw, 18rem)',
            letterSpacing: '-0.055em',
          }}
        >
          LATEST
        </h1>

        {hero && (
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 mt-12 md:mt-16 items-end">
            <div className="md:col-span-6 order-2 md:order-1">
              <div
                className="text-[0.65rem] uppercase tracking-[0.32em] text-ink-500 mb-3"
                style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
              >
                {trackFromSlug(hero.slug)} {hero.issueNumber ? `· ${hero.issueNumber}` : ''}
                {hero.categoryLabel ? ` · ${hero.categoryLabel.split('·').pop()?.trim()}` : ''}
              </div>
              <Link to={`/a/${hero.slug}`} className="group block">
                <h2
                  className="text-ink-900 leading-[1.1] mb-5 group-hover:underline decoration-1 underline-offset-4"
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {hero.title}
                </h2>
                {hero.dek && (
                  <p
                    className="text-ink-700 leading-[1.55] mb-7 max-w-xl"
                    style={{
                      fontFamily: 'Pretendard, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
                    }}
                  >
                    {hero.dek}
                  </p>
                )}
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-ink-900 bg-transparent text-ink-900 px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] group-hover:bg-ink-900 group-hover:text-white transition-colors"
                  style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}
                >
                  READ STORY →
                </span>
              </Link>
              <div
                className="mt-8 text-[0.65rem] uppercase tracking-[0.28em] text-ink-500"
                style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
              >
                {hero.author} · {formatDate(hero.published)} · {hero.readTime} MIN READ
              </div>
            </div>

            <div className="md:col-span-6 order-1 md:order-2">
              <Link to={`/a/${hero.slug}`} className="block">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-ink-900/[0.04]">
                  {hero.heroImage && (
                    <img
                      src={hero.heroImage}
                      alt={hero.heroImageAlt ?? hero.title}
                      className="w-full h-full object-cover"
                      style={{ filter: 'grayscale(100%) contrast(1.05)' }}
                      loading="eager"
                    />
                  )}
                </div>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ───────────────────── STORIES GRID ───────────────────── */}
      <section className="px-5 md:px-10 py-16 md:py-24 border-t border-ink-900/[0.08]">
        <div className="flex items-end justify-between mb-10 md:mb-14 flex-wrap gap-6">
          <h2
            className="text-ink-900 uppercase leading-[0.82]"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(3rem, 11vw, 8rem)',
              letterSpacing: '-0.05em',
            }}
          >
            STORIES
          </h2>
          <p
            className="text-ink-700 max-w-xs leading-[1.5]"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(0.85rem, 1vw, 0.95rem)',
            }}
          >
            한 사람의 하루·동작·식단·믿음을 1차 자료로 따라간다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-14">
          {latest.map((article) => (
            <StoryCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* ───────────────────── ABOUT ───────────────────── */}
      <section className="px-5 md:px-10 py-16 md:py-24 border-t border-ink-900/[0.08]">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
          <div className="md:col-span-6">
            <h2
              className="text-ink-900 uppercase leading-[0.82] mb-8"
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(3rem, 11vw, 8rem)',
                letterSpacing: '-0.05em',
              }}
            >
              ABOUT
            </h2>
            <p
              className="text-ink-700 leading-[1.6] mb-6 max-w-lg"
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
              }}
            >
              Saint-Rémy는 한국의 스포츠·문화·라이프스타일 매거진입니다. 한 사람의 하루를 시간순으로 따라가고, 한 동작이 한 인물을 정의한 자리를 파고들고, 한 식단이 어떻게 신체를 다시 짰는지를 1차 자료로 검증합니다.
            </p>
            <p
              className="text-ink-700 leading-[1.6] mb-8 max-w-lg"
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)',
              }}
            >
              Kinfolk의 깊이와 032c의 강도 사이. RITUAL · PEOPLE · MIND · GEAR 네 트랙으로 연재합니다.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-ink-900 bg-transparent text-ink-900 px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] hover:bg-ink-900 hover:text-white transition-colors"
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}
            >
              READ MORE →
            </Link>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-4 md:gap-6">
            {aboutPhotos.map((a) => (
              <Link
                key={a.slug}
                to={`/a/${a.slug}`}
                className="aspect-square rounded-2xl overflow-hidden bg-ink-900/[0.04] block group"
              >
                {a.heroImage && (
                  <img
                    src={a.heroImage}
                    alt={a.heroImageAlt ?? a.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ filter: 'grayscale(100%) contrast(1.05)' }}
                    loading="lazy"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── MOST READ ───────────────────── */}
      {popular.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-24 border-t border-ink-900/[0.08]">
          <div className="flex items-end justify-between mb-10 md:mb-14 flex-wrap gap-6">
            <h2
              className="text-ink-900 uppercase leading-[0.82]"
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(2.5rem, 9vw, 7rem)',
                letterSpacing: '-0.05em',
              }}
            >
              MOST READ
            </h2>
            <p
              className="text-ink-700 max-w-xs leading-[1.5]"
              style={{
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(0.85rem, 1vw, 0.95rem)',
              }}
            >
              Frequently read stories this season.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-14">
            {popular.map((article) => (
              <StoryCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* ───────────────────── FOOTER ───────────────────── */}
      <footer className="bg-ink-900 text-white px-5 md:px-10 pt-16 pb-10 mt-16">
        <div
          className="text-white uppercase leading-[0.82] mb-12 md:mb-16"
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(3.5rem, 14vw, 10rem)',
            letterSpacing: '-0.05em',
          }}
        >
          SAINT-RÉMY
        </div>
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <div
              className="text-[0.6rem] uppercase tracking-[0.32em] text-white/50 mb-3"
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
            >
              MAGAZINE
            </div>
            <p className="text-white/80 leading-[1.6] text-sm max-w-xs" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              스포츠·문화·라이프스타일을 깊이 보는 한국 매거진. RITUAL · PEOPLE · MIND · GEAR.
            </p>
          </div>
          <div>
            <div
              className="text-[0.6rem] uppercase tracking-[0.32em] text-white/50 mb-3"
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
            >
              SECTIONS
            </div>
            <nav className="flex flex-col gap-1.5 text-white/80 text-sm" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              <Link to="/story" className="hover:text-white">Stories</Link>
              <Link to="/style" className="hover:text-white">Style</Link>
              <Link to="/space" className="hover:text-white">Space</Link>
              <Link to="/travel" className="hover:text-white">Travel</Link>
              <Link to="/music" className="hover:text-white">Music</Link>
            </nav>
          </div>
          <div>
            <div
              className="text-[0.6rem] uppercase tracking-[0.32em] text-white/50 mb-3"
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
            >
              CONTACT
            </div>
            <p className="text-white/80 text-sm" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              @saintremy.kr<br />
              hello@saintremy.kr
            </p>
          </div>
        </div>
        <div
          className="flex flex-wrap justify-between gap-4 pt-8 border-t border-white/10 text-[0.6rem] uppercase tracking-[0.32em] text-white/40"
          style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
        >
          <span>© {new Date().getFullYear()} LLSV</span>
          <span>SAINT-RÉMY · SPORTS CULTURE MAGAZINE</span>
        </div>
      </footer>
    </div>
  )
}
