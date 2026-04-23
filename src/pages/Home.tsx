import { Link } from 'react-router-dom'
import { ArticleCard } from '../components/ArticleCard'
import { AmatorPickCard } from '../components/AmatorPickCard'
import { FilmOfTheWeekCard } from '../components/FilmOfTheWeekCard'
import { Dek } from '../components/Dek'
import { AdSlot } from '../components/AdSlot'
import { NewsletterInline } from '../components/NewsletterInline'
import {
  getHeroArticle,
  getArticlesByCategory,
  getMostReadArticles,
  getAllArticles,
  CATEGORY_LABELS,
  CATEGORY_META,
  ALL_CATEGORIES,
  type Article,
  type Category,
} from '../content/articles'
import {
  getProductForArticle,
  getFeaturedProducts,
  formatPrice,
  getDiscountPercent,
  type Product,
} from '../content/products'

export function Home() {
  const allArticles = getAllArticles()

  // 발행 전 상태 — 샘플 데이터 노출 금지 (쿠팡 파트너스 정책 + 브랜드 신뢰)
  if (allArticles.length === 0) {
    return <PreLaunchHero />
  }

  const hero = getHeroArticle()
  const mostRead = getMostReadArticles()
  const greatestHits = allArticles.slice(Math.max(1, allArticles.length - 4))
  const featuredProducts = getFeaturedProducts()

  // 유튜브 영상이 있는 기사만 필터 (Films 섹션용)
  const articlesWithVideo = allArticles.filter((a) => a.youtube)

  // 히어로 옆 사이드카 결정
  const sidecarDecision = decideHeroSidecar(hero)

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* HERO + SIDECAR */}
      {hero && (
        <section className="py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <HeroArticle article={hero} />
            </div>
            <div className="md:col-span-1">
              {sidecarDecision.type === 'film' &&
                sidecarDecision.article && (
                  <FilmOfTheWeekCard article={sidecarDecision.article} />
                )}
              {sidecarDecision.type === 'product' &&
                sidecarDecision.product && (
                  <AmatorPickCard
                    product={sidecarDecision.product}
                    label="SAINT-RÉMY PICK"
                  />
                )}
            </div>
          </div>
        </section>
      )}

      <div className="dotted-rule my-4" />

      {/* AD SLOT 1: 히어로 → 기사 섹션 사이 (가로 배너) */}
      <AdSlot slot="hero-to-sections" format="horizontal" minHeight="100px" />

      {/* 10 Category Sections */}
      {ALL_CATEGORIES.map((cat) => (
        <SectionBlock
          key={cat}
          category={cat}
          articles={getArticlesByCategory(cat)}
        />
      ))}

      {/* AD SLOT 2: 기사 섹션 → SAINT-RÉMY FILMS 사이 */}
      <AdSlot slot="articles-to-shop" format="horizontal" minHeight="100px" />

      {/* ══════════════════════════════════════════════════════════
          SAINT-RÉMY FILMS — 유튜브 영상 기사 모음 (Watch + Read)
          ══════════════════════════════════════════════════════════ */}
      {articlesWithVideo.length > 0 && (
        <section className="py-10">
          <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-ink-900">
            <div>
              <h2 className="headline-italic text-3xl md:text-4xl text-ink-900 leading-none">
                Films
              </h2>
              <p className="body-text text-ink-500 text-xs mt-2">
                읽기보다 보는 게 편한 분들을 위해
              </p>
            </div>
            <a
              href="https://youtube.com/@saintremy"
              target="_blank"
              rel="noopener noreferrer"
              className="typewriter-label text-ink-500 hover:text-signal transition"
            >
              YOUTUBE →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articlesWithVideo.slice(0, 3).map((article) => (
              <VideoCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* SHOP */}
      {featuredProducts.length > 0 && (
        <section className="py-10">
          <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-ink-900">
            <h2 className="headline-italic text-3xl md:text-4xl text-ink-900 leading-none">
              Shop
            </h2>
            <Link
              to="/shop"
              className="typewriter-label text-ink-500 hover:text-signal transition"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {featuredProducts.slice(0, 5).map((product) => (
              <ShopProductMini key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="typewriter text-ink-400 text-xs">
              * Saint-Rémy는 쿠팡 파트너스 활동 등을 통해 일정액의 수수료를
              제공받을 수 있습니다.
            </p>
          </div>
        </section>
      )}

      {/* GREATEST HITS */}
      {greatestHits.length >= 2 && (
        <section className="py-10">
          <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-ink-900">
            <h2 className="typewriter-label text-ink-900 text-sm">
              — GREATEST HITS
            </h2>
            <Link
              to="/"
              className="typewriter-label text-ink-500 hover:text-signal transition"
            >
              SEE ALL →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {greatestHits.map((article) => (
              <GreatestHitCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* MORE LATEST + MOST READ */}
      {(allArticles.length > 1 || mostRead.length > 0) && (
        <section className="py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <h2 className="typewriter-label text-ink-900 text-sm mb-6 pb-3 border-b-2 border-ink-900">
              — MORE LATEST STORIES
            </h2>
            <div className="divide-y divide-dashed divide-ink-900/25">
              {allArticles.slice(1, 6).map((a) => (
                <ArticleCard key={a.slug} article={a} variant="compact" />
              ))}
            </div>
          </div>

          <aside className="md:col-span-1 relative">
            <div className="absolute -top-3 -right-3 z-10 rotate-[6deg] transform">
              <div
                className="bg-warming px-3 py-1.5 shadow-md"
                style={{
                  clipPath: 'polygon(0% 10%, 100% 0%, 95% 95%, 5% 100%)',
                }}
              >
                <div className="typewriter-label text-ink-900 text-xs font-bold">
                  MOST READ
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="typewriter-label text-ink-900 text-sm mb-6 pb-3 border-b-2 border-ink-900">
                — READER FAVORITES
              </h3>
              {mostRead.length > 0 ? (
                <ol className="space-y-5">
                  {mostRead.map((article, i) => (
                    <MostReadRow
                      key={article.slug}
                      article={article}
                      rank={i + 1}
                    />
                  ))}
                </ol>
              ) : (
                <div className="text-center py-6">
                  <div className="typewriter text-ink-500 text-xs">
                    인기 기사는 독자가 쌓이면 표시됩니다
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>
      )}

      {/* AD SLOT 3: MORE LATEST → NEWSLETTER 사이 */}
      <AdSlot slot="latest-to-newsletter" format="horizontal" minHeight="100px" />

      {/* NEWSLETTER */}
      <section className="bg-ink-900 text-cream-100 px-6 md:px-10 py-14 my-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="typewriter-label text-warming mb-4">
            — WEEKLY DISPATCH
          </div>
          <h3 className="headline-ko text-3xl md:text-4xl leading-tight mb-3">
            매주 한 편의 글이 도착합니다
          </h3>
          <p className="body-text text-cream-300 text-sm md:text-base leading-relaxed mb-6">
            선물 · 할인 · 스타일 · 뷰티 · 공간 · 주방 · 운동 · 여행 · 가구 · 생활.<br />
            평범한 사물을 깊이 보는 매거진.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-transparent border border-cream-300/30 text-cream-100 placeholder-cream-300/50 typewriter focus:outline-none focus:border-warming"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-warming text-ink-900 typewriter-label hover:bg-warming-dark transition"
            >
              SUBSCRIBE
            </button>
          </form>
          <p className="typewriter text-cream-300/60 mt-4 text-xs">
            언제든 구독 취소 가능합니다.
          </p>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PRE-LAUNCH HERO — 기사 0편 상태에서 표시하는 깨끗한 커밍순 화면.
// 샘플/가짜 상품·가격 대신 브랜드·슬로건·뉴스레터 CTA 만.
// ═══════════════════════════════════════════════════════════════
function PreLaunchHero() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 md:pt-28 pb-24 text-center">
      {/* Big masthead */}
      <div
        className="masthead text-ink-900 text-6xl md:text-7xl lg:text-8xl leading-[0.9]"
      >
        Saint-Rémy
      </div>

      {/* Slogan (통일) */}
      <p className="headline-ko text-ink-900 text-2xl md:text-3xl mt-8 leading-snug">
        평범한 사물을 깊이 보는 매거진
      </p>

      {/* Coming soon label */}
      <div className="mt-14 pt-10 border-t border-dashed border-ink-900/25">
        <div className="typewriter-label text-signal mb-3">
          — EDITORS ARE WORKING ON ISSUE 001
        </div>
        <p className="body-text text-ink-500 text-base md:text-lg">
          첫 번째 발행이 곧 공개됩니다.
        </p>
      </div>

      {/* Newsletter — 발행 알림 받기 */}
      <NewsletterInline />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Hero sidecar decision
// ─────────────────────────────────────────────────────────────
interface SidecarDecision {
  type: 'film' | 'product' | 'none'
  article?: Article
  product?: Product
}

function decideHeroSidecar(hero: Article | undefined): SidecarDecision {
  if (!hero) return { type: 'none' }

  // 1. 히어로 기사와 연결된 상품 우선 (Saint-Rémy PICK)
  const related = getProductForArticle(hero.slug)
  if (related) {
    return { type: 'product', product: related }
  }

  // 2. FeaturedOn=FilmOfTheWeek 기사가 있으면 영상
  const featuredFilm = getAllArticles().find(
    (a) => a.featuredOn?.includes('FilmOfTheWeek') && a.youtube,
  )
  if (featuredFilm) {
    return { type: 'film', article: featuredFilm }
  }

  // 3. featured 상품 첫 번째
  const featured = getFeaturedProducts()
  if (featured.length > 0) {
    return { type: 'product', product: featured[0] }
  }

  return { type: 'none' }
}

// ═══════════════════════════════════════════════════════════════
// HERO ARTICLE
// ═══════════════════════════════════════════════════════════════
function HeroArticle({ article }: { article: Article }) {
  return (
    <Link to={`/a/${article.slug}`} className="block group">
      <div
        className="w-full aspect-[4/3] md:aspect-[5/4] mb-5 relative overflow-hidden"
        style={{ backgroundColor: article.thumbnailColor ?? '#2C2724' }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <div className="typewriter-label text-cream-100/70 mb-2">
            {CATEGORY_LABELS[article.category]}
          </div>
          <div className="headline-ko text-cream-100 text-3xl md:text-5xl leading-[1.15] max-w-xl">
            {truncate(article.title, 40)}
          </div>
        </div>
      </div>

      <div>
        <div className="typewriter-label text-signal mb-2">
          — THIS WEEK'S FEATURE
        </div>
        <h1 className="headline-ko text-3xl md:text-4xl lg:text-5xl text-ink-900 group-hover:text-signal transition leading-[1.2]">
          {article.title}
        </h1>
        <Dek
          text={article.dek}
          className="body-text text-ink-500 text-base mt-4 leading-relaxed"
        />
        <div className="flex items-center gap-3 mt-4 typewriter text-ink-500 text-xs">
          <span>{formatDate(article.published)}</span>
          <span className="opacity-40">·</span>
          <span>{article.readTime}분 읽기</span>
          <span className="opacity-40">·</span>
          <span>{article.author}</span>
        </div>
      </div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION BLOCK
// ═══════════════════════════════════════════════════════════════
interface SectionBlockProps {
  category: Category
  articles: Article[]
}

function SectionBlock({ category, articles }: SectionBlockProps) {
  const meta = CATEGORY_META[category]
  return (
    <section className="py-10">
      <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-ink-900">
        <div>
          <h2 className="headline-italic text-3xl md:text-4xl text-ink-900 leading-none">
            {meta.title}
          </h2>
          <p className="body-text text-ink-500 text-xs mt-2">{meta.subtitle}</p>
        </div>
        <Link
          to={`/${category}`}
          className="typewriter-label text-ink-500 hover:text-signal transition"
        >
          VIEW ALL →
        </Link>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {articles.slice(0, 2).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="typewriter-label text-ink-500 mb-2">
            — COMING SOON
          </div>
          <div className="body-text text-ink-500">
            {meta.title} 기사가 곧 공개됩니다
          </div>
        </div>
      )}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SHOP PRODUCT MINI
// ═══════════════════════════════════════════════════════════════
function ShopProductMini({ product }: { product: Product }) {
  const discount = getDiscountPercent(product)
  return (
    <a
      href={product.affiliateURL}
      target="_blank"
      rel="noopener sponsored"
      className="block group text-center lift"
    >
      <div
        className="aspect-square rounded-full overflow-hidden flex items-center justify-center mb-3 relative"
        style={{ backgroundColor: product.thumbnailColor ?? '#E0D6C2' }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="headline-italic text-cream-100/30 text-xl">
            {product.brand}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-signal text-cream-100 px-2 py-0.5 typewriter-label text-[9px]">
            {discount}% OFF
          </div>
        )}
      </div>
      <h4 className="headline text-sm text-ink-900 group-hover:text-signal transition leading-tight px-1">
        {truncate(product.name, 24)}
      </h4>
      <div className="mt-2">
        {product.originalPrice ? (
          <div className="typewriter text-xs">
            <div className="line-through text-ink-400">
              {formatPrice(product.originalPrice)}
            </div>
            <div className="text-signal font-bold">
              {formatPrice(product.price)}
            </div>
          </div>
        ) : (
          <div className="typewriter text-ink-900 text-xs font-medium">
            {formatPrice(product.price)}
          </div>
        )}
      </div>
      <div className="mt-2 typewriter-label text-ink-500 text-[10px]">
        BUY AT {product.vendor}
      </div>
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIDEO CARD — SAINT-RÉMY FILMS 섹션용 (Watch + Read 이중 CTA)
// ═══════════════════════════════════════════════════════════════
function VideoCard({ article }: { article: Article }) {
  if (!article.youtube) return null
  const thumbnail = `https://i.ytimg.com/vi/${article.youtube}/maxresdefault.jpg`
  const fallback = `https://i.ytimg.com/vi/${article.youtube}/hqdefault.jpg`

  return (
    <Link to={`/a/${article.slug}`} className="block group lift">
      {/* Video thumbnail with play overlay */}
      <div className="relative aspect-video bg-ink-900 overflow-hidden">
        <img
          src={thumbnail}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = fallback
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-10 bg-signal flex items-center justify-center rounded group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <div
              className="w-0 h-0 ml-1"
              style={{
                borderLeft: '12px solid white',
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
              }}
            />
          </div>
        </div>

        {/* Corner label */}
        <div className="absolute top-3 left-3 bg-cream-100 px-2 py-0.5">
          <span className="typewriter-label text-ink-900 text-[10px]">
            FILM
          </span>
        </div>
      </div>

      {/* Meta + Title */}
      <div className="mt-3">
        <div className="typewriter-label text-signal text-xs mb-1">
          {CATEGORY_LABELS[article.category]}
        </div>
        <h3 className="headline-ko text-lg md:text-xl text-ink-900 group-hover:text-signal transition leading-tight">
          {truncate(article.title, 50)}
        </h3>
        <div className="typewriter text-ink-500 text-xs mt-2">
          WATCH · READ {article.readTime}분
        </div>
      </div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════
// GREATEST HIT CARD
// ═══════════════════════════════════════════════════════════════
function GreatestHitCard({ article }: { article: Article }) {
  return (
    <Link to={`/a/${article.slug}`} className="block group lift">
      <div
        className="aspect-[4/3] mb-3 relative overflow-hidden"
        style={{ backgroundColor: article.thumbnailColor ?? '#2C2724' }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="headline-ko text-cream-100 text-lg text-center leading-tight">
            {truncate(article.title, 30)}
          </div>
        </div>
      </div>
      <div className="typewriter-label text-ink-500 text-xs mb-1">
        {CATEGORY_LABELS[article.category]}
      </div>
      <h3 className="headline-ko text-base text-ink-900 group-hover:text-signal transition leading-tight">
        {truncate(article.title, 45)}
      </h3>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════
// MOST READ ROW
// ═══════════════════════════════════════════════════════════════
function MostReadRow({
  article,
  rank,
}: {
  article: Article
  rank: number
}) {
  return (
    <li>
      <Link to={`/a/${article.slug}`} className="group flex gap-4 items-start">
        <div className="flex-shrink-0">
          <span className="headline-italic text-3xl text-signal leading-none">
            {rank}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="typewriter text-ink-900 text-sm leading-snug group-hover:text-signal transition">
            {truncate(article.title, 50)}
          </h4>
        </div>
        <div
          className="flex-shrink-0 w-14 h-14 relative overflow-hidden"
          style={{ backgroundColor: article.thumbnailColor ?? '#2C2724' }}
        >
          {article.youtube && (
            <img
              src={`https://i.ytimg.com/vi/${article.youtube}/default.jpg`}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </Link>
    </li>
  )
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function formatDate(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}
