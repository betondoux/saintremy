// src/components/RoundupCard.tsx
// The Strategist "Mother's Day Gifts" 스타일 다중 상품 블록.
// 한 기사에 RoundupCard 가 10~30개 세로로 쌓인다.
// 데이터 모델은 articles.ts:RoundupItem.
//
// 2026-04-25 P0 보강:
//   - sectionIntro: 섹션 도입부 본문 (헤드라인 직후 5-7줄)
//   - originalPrice + discountLabel: 세일 가격 + 오렌지 할인율
//   - isAlternate: true면 메인 카드 아닌 작은 가로 카드로 렌더

import type { RoundupItem } from '../content/articles'

type Props = {
  item: RoundupItem
  isLast?: boolean
}

const MERCHANT_LABEL: Record<RoundupItem['merchant'], string> = {
  coupang: '쿠팡',
  oliveyoung: '올리브영',
  naver: '네이버',
}

// Strategist 톤 오렌지 — 세일 강조
const SALE_ORANGE = '#D85A30'

function trackClick(item: RoundupItem) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { gtag?: (...args: unknown[]) => void }
  if (typeof w.gtag === 'function') {
    w.gtag('event', `${item.merchant}_click`, {
      product_name: item.productName,
      section_title: item.sectionTitle,
    })
  }
}

/**
 * 가격 1줄 표시 (메인/대안 카드 공유).
 * size='lg' = 메인 카드 (이탤릭 17px), 'sm' = 대안 카드 (mono 13px).
 */
function PriceLine({
  item,
  size,
}: {
  item: RoundupItem
  size: 'lg' | 'sm'
}) {
  const main = size === 'lg'
  const orig = item.originalPrice
  const disc = item.discountLabel
  return (
    <span
      style={{
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: main ? '8px' : '6px',
      }}
    >
      {orig && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: main ? '13px' : '11px',
            color: 'var(--sr-muted)',
            textDecoration: 'line-through',
          }}
        >
          {orig}
        </span>
      )}
      <span
        style={
          main
            ? {
                fontFamily: 'var(--font-serif-kr)',
                fontStyle: 'italic',
                fontSize: '17px',
                color: 'var(--sr-ink)',
              }
            : {
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--sr-ink)',
                fontWeight: 600,
              }
        }
      >
        {item.price}
      </span>
      {disc && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: main ? '12px' : '10px',
            color: SALE_ORANGE,
            fontWeight: 600,
          }}
        >
          {disc}
        </span>
      )}
    </span>
  )
}

/**
 * 대안 상품 — 작은 가로 카드 (이미지 좌, 정보 우).
 * 같은 섹션의 메인 상품 아래에 1~3개 들어가는 변형.
 */
function AlternateCard({ item }: { item: RoundupItem }) {
  const merchantLabel = MERCHANT_LABEL[item.merchant]
  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        padding: '14px 0',
        borderBottom: '1px dotted rgba(0,0,0,0.15)',
      }}
    >
      <img
        src={item.productImage}
        alt={item.productImageAlt || item.productName}
        loading="lazy"
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'cover',
          flexShrink: 0,
          borderRadius: '4px',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontFamily: 'var(--font-serif-kr)',
            fontWeight: 700,
            fontSize: '15px',
            lineHeight: 1.3,
            color: 'var(--sr-ink)',
            margin: '0 0 4px',
          }}
        >
          {item.productName}
        </h4>
        <div style={{ marginBottom: '6px' }}>
          <PriceLine item={item} size="sm" />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-serif-kr)',
            fontSize: '13px',
            color: 'var(--sr-muted)',
            lineHeight: 1.5,
            margin: '0 0 10px',
          }}
        >
          {item.body}
        </p>
        <a
          href={item.productUrl}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          onClick={() => trackClick(item)}
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            padding: '6px 12px',
            border: '1px solid var(--sr-ink)',
            color: 'var(--sr-ink)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          BUY AT {merchantLabel} →
        </a>
      </div>
    </div>
  )
}

export default function RoundupCard({ item, isLast = false }: Props) {
  // 대안 카드 분기 — 짧은 가로 카드로 단축 렌더
  if (item.isAlternate) {
    return <AlternateCard item={item} />
  }

  const merchantLabel = MERCHANT_LABEL[item.merchant]
  const ctaLabel = item.ctaLabel ?? `${merchantLabel}에서 보기`

  return (
    <article style={{ marginTop: '40px', marginBottom: isLast ? '24px' : '40px' }}>
      {/* 섹션 헤드라인 — 이탤릭 세리프 */}
      <h2
        style={{
          fontFamily: 'var(--font-serif-kr)',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: '28px',
          lineHeight: 1.25,
          color: 'var(--sr-ink)',
          marginBottom: '20px',
          letterSpacing: '-0.01em',
        }}
      >
        {item.sectionTitle}
      </h2>

      {/* 섹션 카테고리 도입부 (옵션) — 5~7줄 본문, 메인 카드에만 작성 */}
      {item.sectionIntro && (
        <div
          style={{
            fontFamily: 'var(--font-serif-kr)',
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--sr-ink)',
            margin: '12px 0 24px',
            maxWidth: '640px',
          }}
        >
          {item.sectionIntro.split('\n\n').map((para, i) => (
            <p key={i} style={{ marginBottom: '12px' }}>
              {para}
            </p>
          ))}
        </div>
      )}

      {/* 노란 형광 스티커 (옵션) */}
      {item.badge && (
        <div
          style={{
            display: 'inline-block',
            background: '#FFF45C',
            color: '#1a1a1a',
            padding: '6px 14px',
            fontFamily: 'var(--font-display-en)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.04em',
            transform: 'rotate(-2deg)',
            marginBottom: '12px',
            clipPath:
              'polygon(0 8%, 96% 0, 100% 92%, 4% 100%, 0 80%, 5% 60%, 0 40%)',
          }}
        >
          {item.badge}
        </div>
      )}

      {/* 정사각 히어로 이미지 + 우상단 ♡ 아이콘 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          background: '#FFFFFF',
          marginBottom: '16px',
          overflow: 'hidden',
        }}
      >
        <img
          src={item.productImage}
          alt={item.productImageAlt}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* 저장 아이콘 — 시각적 장식, 실제 저장 기능은 추후 */}
        <button
          type="button"
          aria-label="저장"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--sr-ink)',
          }}
          onClick={(e) => e.preventDefault()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* 제목(좌) + 가격(우) — 점선 하단 구분선 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '14px',
          borderBottom: '1px dotted var(--sr-ink)',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-serif-kr)',
            fontWeight: 700,
            fontSize: '17px',
            lineHeight: 1.4,
            color: 'var(--sr-ink)',
            flex: '1 1 auto',
            margin: 0,
          }}
        >
          {item.productName}
        </h3>
        <span style={{ flex: '0 0 auto' }}>
          <PriceLine item={item} size="lg" />
        </span>
      </div>

      {/* 본문 카피 */}
      <p
        style={{
          fontFamily: 'var(--font-serif-kr)',
          fontSize: '16px',
          lineHeight: 1.75,
          color: 'var(--sr-ink)',
          marginBottom: '20px',
        }}
      >
        {item.body}
      </p>

      {/* 전폭 외곽선 CTA 버튼 — The Strategist 스타일 */}
      <a
        href={item.productUrl}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={() => trackClick(item)}
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '16px 20px',
          border: '1px solid var(--sr-ink)',
          background: 'transparent',
          color: 'var(--sr-ink)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          transition: 'background 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--sr-ink)'
          e.currentTarget.style.color = 'var(--sr-bg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--sr-ink)'
        }}
      >
        {item.price} · {ctaLabel} →
      </a>

      {/* 점선 구분선 — 마지막 아이템 제외 */}
      {!isLast && (
        <div
          style={{
            marginTop: '40px',
            borderTop: '1px dotted var(--sr-ink)',
            opacity: 0.4,
          }}
        />
      )}
    </article>
  )
}
