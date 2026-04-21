import { useEffect, useRef } from 'react'

// Vite가 빌드 시점에 환경변수를 주입합니다.
const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as
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
 * AdSense 광고 슬롯.
 *
 * 3가지 모드:
 * 1. VITE_ADSENSE_CLIENT_ID 설정됨 → 실제 AdSense 광고 로드
 * 2. VITE_SHOW_AD_PLACEHOLDER=true → 광고 자리 placeholder 표시 (개발용)
 * 3. 둘 다 아님 → 아무것도 렌더링 안 함 (깔끔한 프로덕션)
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

  // Mode 2: Placeholder - AdSense 승인 전 자리 시각화
  // 환경변수 VITE_HIDE_AD_PLACEHOLDER=true 로 설정하면 숨김
  if (!ADSENSE_CLIENT_ID) {
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

  // 슬롯 없으면 숨김
  if (!slot) {
    return null
  }

  // Mode 1: 실제 AdSense 광고
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
