import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllProducts,
  getProductsByCategory,
  formatPrice,
  getDiscountPercent,
  CATEGORY_LABELS_PRODUCT,
  type Product,
  type ProductCategory,
} from '../content/products'

type FilterOption = 'all' | ProductCategory

const FILTER_LABELS: Record<FilterOption, string> = {
  all: 'All (전체)',
  gift: 'Gift (선물)',
  deal: 'Deal (할인)',
  style: 'Style (스타일)',
  beauty: 'Beauty (뷰티)',
  space: 'Space (공간)',
  kitchen: 'Kitchen (주방)',
  move: 'Move (운동)',
  travel: 'Travel (여행)',
  furniture: 'Furniture (가구)',
  living: 'Living (생활)',
  books: 'Books (책)',
}

export function ShopPage() {
  const [filter, setFilter] = useState<FilterOption>('all')

  const allProducts = getAllProducts()
  const filteredProducts =
    filter === 'all' ? allProducts : getProductsByCategory(filter)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="text-center mb-10">
        <div className="typewriter-label text-signal mb-3">— SAINT-RÉMY SHOP</div>
        <h1 className="masthead text-6xl md:text-7xl text-ink-900 leading-none">
          Shop
        </h1>
        <p className="body-text text-ink-500 max-w-xl mx-auto mt-4 text-base md:text-lg leading-relaxed">
          아마토르가 직접 써보고, 읽어보고, 뛰어본 것들.
          <br />
          모든 링크는 투명하게 공개합니다.
        </p>
      </header>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 pb-6 border-b-2 border-ink-900">
        {(Object.keys(FILTER_LABELS) as FilterOption[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 typewriter-label border transition ${
              filter === key
                ? 'bg-ink-900 text-cream-100 border-ink-900'
                : 'text-ink-900 border-ink-900/30 hover:border-ink-900'
            }`}
          >
            {FILTER_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="typewriter-label text-ink-500 mb-2">
            — COMING SOON
          </div>
          <div className="body-text text-ink-500">
            이 카테고리의 추천 상품이 곧 올라옵니다.
          </div>
        </div>
      )}

      {/* Disclosure */}
      <section className="mt-20 border-t border-dashed border-ink-900/30 pt-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="typewriter-label text-ink-900 mb-4">
            — TRANSPARENCY
          </div>
          <h2 className="headline-ko text-2xl md:text-3xl text-ink-900 mb-4">
            수익 구조를 공개합니다
          </h2>
          <div className="body-text text-ink-500 space-y-3 text-sm md:text-base text-left">
            <p>
              Saint-Rémy는 쿠팡 파트너스, 네이버 쇼핑 파트너 등 어필리에이트
              프로그램을 통해 수익을 얻습니다. 독자가 Saint-Rémy에서 제품 링크를
              클릭하여 구매하면, 판매 금액의 일부를 수수료로 받습니다.
            </p>
            <p>
              <strong className="text-ink-900">단, 이것이 제품 추천에 영향을 미치지 않습니다.</strong>{' '}
              Saint-Rémy는 수수료율이 높은 제품이 아니라, 실제로 좋은 제품만
              추천합니다. 모든 링크는 독자가 직접 클릭 여부를 선택할 수
              있도록 투명하게 표시됩니다.
            </p>
            <p>
              수익은 Saint-Rémy의 콘텐츠 제작, 서버 유지, 새로운 연구 구독 등에
              재투자됩니다. 신뢰가 전부입니다.
            </p>
          </div>

          <Link
            to="/"
            className="inline-block mt-8 typewriter-label text-signal hover:underline"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const discount = getDiscountPercent(product)
  return (
    <a
      href={product.affiliateURL}
      target="_blank"
      rel="noopener sponsored"
      className="block group lift"
      aria-label={`${product.name} - ${product.vendor}에서 보기`}
    >
      <div
        className="aspect-square rounded-full overflow-hidden mb-4 relative flex items-center justify-center"
        style={{ backgroundColor: product.thumbnailColor ?? '#E0D6C2' }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="headline-italic text-cream-100/30 text-3xl">
            {product.brand}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-signal text-cream-100 px-2 py-1 typewriter-label text-xs">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="typewriter-label text-ink-500 text-xs mb-1 text-center">
        {CATEGORY_LABELS_PRODUCT[product.category]} · {product.brand}
      </div>

      <h3 className="headline text-base md:text-lg text-ink-900 group-hover:text-signal transition leading-tight text-center px-2">
        {product.name}
      </h3>

      <p className="body-text text-ink-500 text-xs md:text-sm text-center mt-2 px-2 leading-snug">
        {product.dek.length > 80
          ? product.dek.slice(0, 80) + '…'
          : product.dek}
      </p>

      <div className="text-center mt-3">
        {product.originalPrice ? (
          <div className="typewriter text-sm">
            <span className="line-through text-ink-400 mr-1">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-signal font-bold">
              NOW {formatPrice(product.price)}
            </span>
          </div>
        ) : (
          <div className="typewriter text-ink-900 text-sm font-medium">
            {formatPrice(product.price)}
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <span className="inline-block border border-ink-900 px-4 py-2 typewriter-label text-ink-900 group-hover:bg-ink-900 group-hover:text-cream-100 transition">
          BUY AT {product.vendor}
        </span>
      </div>
    </a>
  )
}
