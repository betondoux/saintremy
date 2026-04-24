// src/components/DuelProductCard.tsx
// The Duel 기사용 - 제품 2개 비교 카드 컴포넌트
// 모바일: 세로 스택 (2열 뷰가 모바일에서 카드 하나씩 너무 작아지지 않도록)
// 데스크톱: 2열 나란히

import React from 'react'

export interface DuelProduct {
  position: 'A' | 'B'
  brand: string
  name: string
  modelCode: string
  image: string
  listPrice: number
  salePrice?: number | null
  discountPercent?: number | null
  priceNote?: string
  releaseDate: string
  productUrl: string
  ctaLabel: string
  keyFeatures: string[]
  bestFor: string
}

interface Props {
  product: DuelProduct
  accentColor?: string // The Duel은 #2A1810 다크 초콜릿
}

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

export const DuelProductCard: React.FC<Props> = ({ 
  product, 
  accentColor = '#2A1810' 
}) => {
  const {
    position, brand, name, modelCode, image,
    listPrice, salePrice, discountPercent, priceNote,
    productUrl, ctaLabel, keyFeatures, bestFor
  } = product

  const showSale = salePrice && salePrice < listPrice

  return (
    <div
      style={{
        background: 'var(--sr-bg-alt, #FAF6EF)',
        border: '1px solid var(--sr-line, #E5DCC8)',
        borderRadius: '4px',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'relative',
      }}
    >
      {/* Position Badge (A or B) */}
      <div
        style={{
          position: 'absolute',
          top: '-14px',
          left: '24px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: accentColor,
          color: 'var(--sr-bg, #F4EFE8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--sr-font-serif)',
          fontSize: '14px',
          fontWeight: 700,
        }}
      >
        {position}
      </div>

      {/* 제품 이미지 */}
      <div
        style={{
          height: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <img
          src={image}
          alt={`${brand} ${name}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* 브랜드 */}
      <div
        style={{
          fontFamily: 'var(--sr-font-mono)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: 'var(--sr-muted, #8B7F72)',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}
      >
        {brand}
      </div>

      {/* 제품명 */}
      <h3
        style={{
          fontFamily: 'var(--sr-font-serif)',
          fontSize: '24px',
          fontWeight: 700,
          lineHeight: 1.2,
          color: 'var(--sr-ink, #1A1512)',
          margin: '0 0 4px 0',
        }}
      >
        {name}
      </h3>

      {/* 모델 코드 */}
      <div
        style={{
          fontFamily: 'var(--sr-font-mono)',
          fontSize: '11px',
          color: 'var(--sr-muted, #8B7F72)',
          marginBottom: '20px',
        }}
      >
        {modelCode}
      </div>

      {/* 가격 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        {showSale ? (
          <>
            <span
              style={{
                fontFamily: 'var(--sr-font-serif)',
                fontSize: '15px',
                color: 'var(--sr-muted)',
                textDecoration: 'line-through',
              }}
            >
              {formatPrice(listPrice)}
            </span>
            <span
              style={{
                fontFamily: 'var(--sr-font-serif)',
                fontSize: '26px',
                fontWeight: 700,
                color: 'var(--sr-ink)',
              }}
            >
              {formatPrice(salePrice!)}
            </span>
            {discountPercent && (
              <span
                style={{
                  padding: '3px 8px',
                  background: accentColor,
                  color: 'var(--sr-bg)',
                  fontFamily: 'var(--sr-font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {discountPercent}% OFF
              </span>
            )}
          </>
        ) : (
          <span
            style={{
              fontFamily: 'var(--sr-font-serif)',
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--sr-ink)',
            }}
          >
            {formatPrice(listPrice)}
          </span>
        )}
      </div>

      {/* 가격 하단 주석 (와우 회원 혜택가 등) */}
      {priceNote && (
        <div
          style={{
            fontFamily: 'var(--sr-font-mono)',
            fontSize: '11px',
            color: 'var(--sr-muted)',
            marginTop: '-10px',
            marginBottom: '16px',
          }}
        >
          {priceNote}
        </div>
      )}

      {/* 핵심 기능 리스트 */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 24px 0',
        }}
      >
        {keyFeatures.map((feat, i) => (
          <li
            key={i}
            style={{
              fontFamily: 'var(--sr-font-serif)',
              fontSize: '14px',
              color: 'var(--sr-ink)',
              lineHeight: 1.6,
              paddingLeft: '14px',
              position: 'relative',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: 0,
                color: accentColor,
                fontWeight: 700,
              }}
            >
              ·
            </span>
            {feat}
          </li>
        ))}
      </ul>

      {/* Best For */}
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--sr-bg, #F4EFE8)',
          borderLeft: `3px solid ${accentColor}`,
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--sr-font-mono)',
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: 'var(--sr-muted)',
            marginBottom: '4px',
          }}
        >
          BEST FOR
        </div>
        <div
          style={{
            fontFamily: 'var(--sr-font-serif)',
            fontSize: '13px',
            color: 'var(--sr-ink)',
            lineHeight: 1.5,
          }}
        >
          {bestFor}
        </div>
      </div>

      {/* CTA 버튼 */}
      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        style={{
          display: 'block',
          background: accentColor,
          color: 'var(--sr-bg)',
          padding: '18px 0',
          textAlign: 'center',
          fontFamily: 'var(--sr-font-serif)',
          fontSize: '15px',
          fontWeight: 500,
          textDecoration: 'none',
          letterSpacing: '0.02em',
          transition: 'opacity 0.2s',
          marginTop: 'auto',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        {ctaLabel} →
      </a>
    </div>
  )
}

export default DuelProductCard
