// src/components/RoundupCard.tsx
// The Strategist "Mother's Day Gifts" 스타일 다중 상품 블록.
// 한 기사에 RoundupCard 가 10~30개 세로로 쌓인다.
// 데이터 모델은 articles.ts:RoundupItem.

import type { RoundupItem } from '../content/articles'

type Props = {
  item: RoundupItem
  isLast?: boolean
}

const MERCHANT_LABEL: Record<RoundupItem['merchant'], string> = {
  coupang: '쿠팡',
  oliveyoung: '올리브영',
}

export default function RoundupCard({ item, isLast = false }: Props) {
  const merchantLabel = MERCHANT_LABEL[item.merchant]
  const ctaLabel = item.ctaLabel ?? `${merchantLabel}에서 보기`

  const handleClick = () => {
    if (typeof window === 'undefined') return
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (typeof w.gtag === 'function') {
      w.gtag('event', `${item.merchant}_click`, {
        product_name: item.productName,
        section_title: item.sectionTitle,
      })
    }
  }

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
        <span
          style={{
            fontFamily: 'var(--font-serif-kr)',
            fontStyle: 'italic',
            fontSize: '17px',
            color: 'var(--sr-ink)',
            whiteSpace: 'nowrap',
            flex: '0 0 auto',
          }}
        >
          {item.price}
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
        onClick={handleClick}
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
