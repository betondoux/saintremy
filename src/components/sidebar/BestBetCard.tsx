// src/components/sidebar/BestBetCard.tsx
// The Strategist 스타일 "Best Bet" 사이드바 — 히어로 제품 원형 컷 + 가격 + CTA.
// 기사 frontmatter.heroProduct 에서 데이터 수신.

type Merchant = 'coupang' | 'oliveyoung' | 'ohouse'

export interface BestBetProduct {
  name: string
  image: string
  originalPrice?: number
  salePrice: number
  url: string
  merchant: Merchant
  discount?: number
}

const MERCHANT_LABEL: Record<Merchant, string> = {
  coupang: '쿠팡에서 보기',
  oliveyoung: '올리브영에서 보기',
  ohouse: '오늘의집에서 보기',
}

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR')
}

export default function BestBetCard({ product }: { product: BestBetProduct }) {
  const showOriginal =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.salePrice
  const rel =
    product.merchant === 'coupang'
      ? 'noopener sponsored nofollow'
      : 'noopener sponsored nofollow'

  return (
    <aside
      className="p-6 rounded-lg border"
      style={{ backgroundColor: '#F4EFE8', borderColor: '#E5E0D6' }}
    >
      <div className="text-center">
        <div
          className="font-bold"
          style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--sr-ink, #0A0A0B)',
          }}
        >
          BEST BET
        </div>
        <div
          className="uppercase mt-1"
          style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: '#8A8580',
          }}
        >
          Pick of the Week
        </div>
      </div>

      <div className="flex justify-center my-5">
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4"
            loading="lazy"
          />
        </div>
      </div>

      <h3
        className="text-center font-serif text-base font-bold leading-snug mb-3"
        style={{ color: '#0A0A0B' }}
      >
        {product.name}
      </h3>

      <div className="flex items-baseline justify-center gap-2 flex-wrap mb-5">
        {showOriginal && (
          <span
            className="line-through text-sm"
            style={{ color: '#A8A49F' }}
          >
            {formatPrice(product.originalPrice!)}원
          </span>
        )}
        <span
          className="text-xl font-bold"
          style={{ color: '#0A0A0B' }}
        >
          {formatPrice(product.salePrice)}원
        </span>
        {typeof product.discount === 'number' && product.discount > 0 && (
          <span
            className="text-xs font-bold"
            style={{ color: '#C4361C' }}
          >
            -{product.discount}%
          </span>
        )}
      </div>

      <a
        href={product.url}
        target="_blank"
        rel={rel}
        className="block text-center text-sm py-3 rounded transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#0A0A0B', color: '#FFFFFF' }}
      >
        {MERCHANT_LABEL[product.merchant]} →
      </a>
    </aside>
  )
}
