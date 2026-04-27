import { Link } from 'react-router-dom'
import type { Pick } from '../content/articles'

type Props = {
  badge?: string
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaUrl: string
  items: Pick[]
}

function formatKRW(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

export default function SaleCarousel({
  badge = '이번 주 딜',
  title,
  subtitle,
  ctaLabel = 'SHOP THE SALE',
  ctaUrl,
  items,
}: Props) {
  if (items.length === 0) return null

  return (
    <section
      className="my-16"
      style={{
        borderTop: '1px dashed var(--sr-rule)',
        paddingTop: '40px',
      }}
    >
      <div
        className="max-w-6xl mx-auto px-6"
        style={{ position: 'relative' }}
      >
        {/* 노란 형광 스티커 배지 — RoundupCard badge 패턴 재사용 */}
        <div className="flex justify-center mb-8">
          <div
            style={{
              display: 'inline-block',
              background: '#FFF45C',
              color: '#1a1a1a',
              padding: '10px 22px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              transform: 'rotate(-2deg)',
              clipPath:
                'polygon(0 8%, 96% 0, 100% 92%, 4% 100%, 0 80%, 5% 60%, 0 40%)',
            }}
          >
            {badge}
          </div>
        </div>

        {/* 가로 스크롤 캐러셀 — 모바일 스와이프 + 데스크톱 가로 스크롤바 */}
        <div className="sale-carousel-track">
          {items.map((it, i) => (
            <a
              key={i}
              href={it.productUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="sale-carousel-item"
            >
              <div className="sale-carousel-imgwrap">
                <img
                  src={it.productImage}
                  alt={it.productImageAlt}
                  loading="lazy"
                />
              </div>
              <div className="sale-carousel-prices">
                <span className="sale-carousel-orig">
                  {formatKRW(it.originalPrice)}
                </span>
                <span className="sale-carousel-now">
                  NOW {formatKRW(it.salePrice)}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* 제목 + CTA */}
        <div className="text-center mt-10">
          <h2
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 700,
              color: 'var(--sr-ink)',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="mt-1"
              style={{
                fontFamily: 'var(--font-serif-kr)',
                fontSize: 'clamp(18px, 2.4vw, 26px)',
                fontWeight: 700,
                color: 'var(--sr-ink)',
              }}
            >
              {subtitle}
            </p>
          )}
          <Link
            to={ctaUrl}
            className="inline-flex items-center gap-2 mt-5 hover:opacity-70 transition"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--sr-ink)',
            }}
          >
            {ctaLabel}
            <span style={{ color: '#D85A30' }}>▸</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
