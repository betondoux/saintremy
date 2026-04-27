import { useEffect, useMemo, useRef } from 'react'

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as
  | string
  | undefined
const COUPANG_BANNER_ID = import.meta.env.VITE_COUPANG_BANNER_ID as
  | string
  | undefined
const COUPANG_TRACKING_CODE = import.meta.env.VITE_COUPANG_TRACKING_CODE as
  | string
  | undefined

interface Props {
  slot?: string
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical'
  minHeight?: string
  label?: string
  className?: string
}

/**
 * 광고 슬롯 — 우선순위:
 * 1) AdSense (VITE_ADSENSE_CLIENT_ID + slot 있음)
 * 2) 쿠팡 파트너스 다이나믹 배너 (VITE_COUPANG_BANNER_ID + VITE_COUPANG_TRACKING_CODE) — AdSense 승인 전 임시
 * 3) 점선 placeholder (VITE_HIDE_AD_PLACEHOLDER !== 'true')
 * 4) null
 */
export function AdSlot({
  slot,
  format = 'auto',
  minHeight = '90px',
  label = '— ADVERTISEMENT',
  className = '',
}: Props) {
  const adRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || !slot) return

    try {
      // @ts-expect-error - adsbygoogle is added by Google script
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.warn('AdSense push failed:', err)
    }
  }, [slot])

  if (ADSENSE_CLIENT_ID && slot) {
    return (
      <div
        className={`w-full my-10 ${className}`}
        style={{ minHeight }}
      >
        {label && (
          <div className="typewriter-label text-ink-400 text-center mb-2">
            {label}
          </div>
        )}
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            minHeight,
          }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  if (COUPANG_BANNER_ID && COUPANG_TRACKING_CODE) {
    return <CoupangBannerSlot label={label} className={className} />
  }

  if (import.meta.env.VITE_HIDE_AD_PLACEHOLDER === 'true') {
    return null
  }

  return (
    <div
      className={`w-full my-10 ${className}`}
      style={{ minHeight }}
    >
      {label && (
        <div className="typewriter-label text-ink-400 text-center mb-2">
          {label}
        </div>
      )}
      <div
        className="border border-dashed border-ink-900/20 bg-cream-200/40 flex items-center justify-center"
        style={{ minHeight }}
      >
        <div className="text-center py-6">
          <div className="typewriter text-ink-400 text-xs">
            Advertisement
          </div>
        </div>
      </div>
    </div>
  )
}

function CoupangBannerSlot({
  label,
  className,
}: {
  label: string
  className: string
}) {
  const width = 680
  const height = 140

  const srcDoc = useMemo(
    () =>
      `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script src="https://ads-partners.coupang.com/g.js"></script><script>new PartnersCoupang.G({"id":${Number(COUPANG_BANNER_ID)},"template":"carousel","trackingCode":${JSON.stringify(COUPANG_TRACKING_CODE)},"width":"${width}","height":"${height}","tsource":""});</script></body></html>`,
    [],
  )

  return (
    <aside
      aria-label="제휴 광고 — 쿠팡 파트너스"
      className={`w-full my-10 ${className}`}
    >
      {label && (
        <div className="typewriter-label text-ink-400 text-center mb-2">
          {label}
        </div>
      )}
      <div className="flex justify-center max-w-full overflow-hidden">
        <iframe
          title="쿠팡 파트너스 추천 상품"
          srcDoc={srcDoc}
          width={width}
          height={height}
          loading="lazy"
          scrolling="no"
          style={{ border: 0, maxWidth: '100%' }}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </aside>
  )
}
