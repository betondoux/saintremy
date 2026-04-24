// src/components/PickCard.tsx
// 딜 레이더 기사용 픽 카드 — 제품 이미지 + 가격 + 4팩트 + 쿠팡 CTA.
// CTA 버튼은 사업의 핵심 (인스타 → 사이트 → 쿠팡 전환). 절대 안 깨지게.

import type { Pick } from '../content/articles'

type Props = {
  pick: Pick
}

const DEAL_COLOR = 'var(--cat-deal)' // #7A2E2A 버건디

export default function PickCard({ pick }: Props) {
  const formatPrice = (price: number) => price.toLocaleString('ko-KR')

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void }
      if (typeof w.gtag === 'function') {
        w.gtag('event', 'coupang_click', {
          pick_rank: pick.rank,
          product_name: pick.name,
        })
      }
    }
  }

  return (
    <article className="my-16">
      {/* Pick 번호 + 카테고리 */}
      <div className="flex items-baseline gap-4 mb-6">
        <span
          style={{
            fontFamily: 'var(--font-serif-kr)',
            fontSize: '24px',
            fontWeight: 700,
            color: DEAL_COLOR,
          }}
        >
          Pick {pick.rank}.
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.2em',
            color: 'var(--sr-muted)',
            textTransform: 'uppercase',
          }}
        >
          {pick.category}
        </span>
      </div>

      {/* 제품 이름 */}
      <h2
        style={{
          fontFamily: 'var(--font-serif-kr)',
          fontSize: 'var(--fs-h2)',
          fontWeight: 600,
          color: 'var(--sr-ink)',
          lineHeight: 1.3,
          marginBottom: '24px',
        }}
      >
        {pick.name}
      </h2>

      {/* 제품 이미지 */}
      <div
        className="mb-6 flex items-center justify-center"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--sr-rule)',
          padding: '32px',
          aspectRatio: '16 / 10',
        }}
      >
        <img
          src={pick.productImage}
          alt={pick.productImageAlt}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* 가격 블록 */}
      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <span
          style={{
            fontSize: '18px',
            color: 'var(--sr-muted)',
            textDecoration: 'line-through',
          }}
        >
          {formatPrice(pick.originalPrice)}원
        </span>
        <span style={{ color: 'var(--sr-muted)' }}>→</span>
        <span
          style={{
            fontFamily: 'var(--font-serif-kr)',
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--sr-ink)',
          }}
        >
          {formatPrice(pick.salePrice)}원
        </span>
        <span
          style={{
            backgroundColor: DEAL_COLOR,
            color: '#FFFFFF',
            padding: '4px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {pick.discountRate}% OFF
        </span>
      </div>

      {/* 헤드라인 + 설명 */}
      <p
        style={{
          fontSize: 'var(--fs-body)',
          fontWeight: 600,
          color: 'var(--sr-ink)',
          lineHeight: 1.5,
          marginBottom: '12px',
        }}
      >
        {pick.headline}
      </p>
      <p
        style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--sr-ink)',
          lineHeight: 1.7,
          marginBottom: '24px',
        }}
      >
        {pick.description}
      </p>

      {/* 4팩트 리스트 */}
      <ul
        className="space-y-2 mb-8"
        style={{
          fontSize: 'var(--fs-meta)',
          color: 'var(--sr-ink)',
          lineHeight: 1.6,
        }}
      >
        <li>
          <strong>가격 매력도:</strong> {pick.pricePoint}
        </li>
        <li>
          <strong>배송:</strong> {pick.delivery}
        </li>
        <li>
          <strong>혜택:</strong> {pick.benefit}
        </li>
        <li>
          <strong>적합 독자:</strong> {pick.targetReader}
        </li>
      </ul>

      {/* 쿠팡 CTA — 사업의 핵심 */}
      <a
        href={pick.productUrl}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={handleClick}
        className="block w-full text-center transition-opacity hover:opacity-90"
        style={{
          backgroundColor: DEAL_COLOR,
          color: '#FFFFFF',
          padding: '20px 24px',
          fontFamily: 'var(--font-serif-kr)',
          fontSize: '18px',
          fontWeight: 600,
        }}
      >
        {pick.ctaLabel} →
      </a>
    </article>
  )
}
