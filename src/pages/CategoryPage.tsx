import { useLocation, useParams } from 'react-router-dom'
import { ArticleCard } from '../components/ArticleCard'
import {
  getArticlesByCategory,
  CATEGORY_META,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
  type Category,
  type Article,
} from '../content/articles'
import { getProductsByCategory, type ProductCategory } from '../content/products'
import { Link } from 'react-router-dom'
import { formatPrice, getDiscountPercent } from '../content/products'
import type { Product } from '../content/products'

export function CategoryPage() {
  const params = useParams<{ category?: string }>()
  const location = useLocation()
  const segment = location.pathname.split('/').filter(Boolean)[0] ?? ''
  const categoryCandidate = (params.category ?? segment) as Category

  if (!ALL_CATEGORIES.includes(categoryCandidate)) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="typewriter-label text-ink-500 mb-4">— 404</div>
        <div className="headline text-3xl text-ink-900">
          카테고리를 찾을 수 없습니다
        </div>
      </div>
    )
  }

  const meta = CATEGORY_META[categoryCandidate]
  const articles = getArticlesByCategory(categoryCandidate)

  // 이 카테고리의 영상이 있는 기사들
  const categoryVideos = articles.filter((a) => a.youtube).slice(0, 3)

  // 같은 카테고리의 상품 추천
  const relatedProducts = getProductsByCategory(
    categoryCandidate as ProductCategory,
  ).slice(0, 4)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="text-center mb-10 pb-8 border-b-2 border-ink-900">
        <div className="text-5xl mb-3">{meta.icon}</div>
        <h1 className="headline-ko text-5xl md:text-6xl text-ink-900 leading-none">
          {meta.title}
        </h1>
        <p className="body-text text-ink-500 max-w-xl mx-auto mt-4 text-base md:text-lg leading-relaxed">
          {meta.subtitle}
        </p>
      </header>

      {/* Articles */}
      <div>
        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <div className="typewriter-label text-ink-500 mb-2">
              — COMING SOON
            </div>
            <div className="body-text text-ink-500">
              첫 번째 글이 곧 올라옵니다.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-dashed divide-ink-900/25">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════
          Films in this category — 이 카테고리 관련 영상
          ═════════════════════════════════════════════════════════ */}
      {categoryVideos.length > 0 && (
        <section className="mt-16 pt-10 border-t-2 border-ink-900">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="headline-ko text-2xl md:text-3xl text-ink-900 leading-none">
                {meta.title} 영상
              </h2>
              <p className="body-text text-ink-500 text-xs mt-2">
                이 카테고리의 영상 스토리
              </p>
            </div>
            <a
              href="https://youtube.com/@amator.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="typewriter-label text-ink-500 hover:text-signal transition"
            >
              YOUTUBE →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryVideos.map((video) => (
              <CategoryVideoCard key={video.slug} article={video} />
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-10 border-t-2 border-ink-900">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="headline-ko text-2xl md:text-3xl text-ink-900 leading-none">
                {meta.title} 추천
              </h2>
              <p className="body-text text-ink-500 text-xs mt-2">
                이 카테고리 추천 상품
              </p>
            </div>
            <Link
              to="/shop"
              className="typewriter-label text-ink-500 hover:text-signal transition"
            >
              ALL PRODUCTS →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductMini key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="typewriter text-ink-400 text-xs">
              * AMATOR는 쿠팡 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

// Product mini card
function ProductMini({ product }: { product: Product }) {
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
        {product.name.length > 24 ? product.name.slice(0, 24) + '…' : product.name}
      </h4>
      <div className="mt-2 typewriter text-ink-900 text-xs font-medium">
        {formatPrice(product.price)}
      </div>
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY VIDEO CARD — 카테고리별 영상 미니 카드
// ═══════════════════════════════════════════════════════════════
function CategoryVideoCard({ article }: { article: Article }) {
  if (!article.youtube) return null
  const thumbnail = `https://i.ytimg.com/vi/${article.youtube}/maxresdefault.jpg`
  const fallback = `https://i.ytimg.com/vi/${article.youtube}/hqdefault.jpg`

  return (
    <Link to={`/a/${article.slug}`} className="block group lift">
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

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-8 bg-signal flex items-center justify-center rounded group-hover:scale-110 transition-transform duration-300">
            <div
              className="w-0 h-0 ml-1"
              style={{
                borderLeft: '10px solid white',
                borderTop: '7px solid transparent',
                borderBottom: '7px solid transparent',
              }}
            />
          </div>
        </div>

        <div className="absolute top-2 left-2 bg-cream-100 px-2 py-0.5">
          <span className="typewriter-label text-ink-900 text-[9px]">
            FILM
          </span>
        </div>
      </div>

      <div className="mt-2">
        <div className="typewriter-label text-signal text-[10px] mb-1">
          {CATEGORY_LABELS[article.category]}
        </div>
        <h4 className="headline-ko text-base text-ink-900 group-hover:text-signal transition leading-tight">
          {article.title.length > 45
            ? article.title.slice(0, 45) + '…'
            : article.title}
        </h4>
      </div>
    </Link>
  )
}