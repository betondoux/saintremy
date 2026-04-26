import React from 'react'

/**
 * The Strategist 톤 — 글과 글 사이에 들어가는 슬롯.
 * 자체 프로모션 / 시즌 배너 / 광고 자리로 활용.
 *
 * 현재는 시각적 placeholder 박스 (운영 시 콘텐츠 채우기 쉬움).
 * 라이브에 노출되니 카피는 차분하게 — 잡지 톤 유지.
 */

type PromoSlotKind =
  | 'self-promo'    // 자체 프로모션 (인스타 / 다른 글 / 뉴스레터)
  | 'season'        // 시즌 배너 (어버이날 / 추석 / 블프)
  | 'ad'            // 외부 광고
  | 'placeholder'   // 빈 슬롯 (지금 단계)

interface PromoSlotProps {
  kind?: PromoSlotKind
  children?: React.ReactNode
}

export const PromoSlot: React.FC<PromoSlotProps> = ({
  kind = 'placeholder',
  children,
}) => {
  // 콘텐츠 있으면 그대로 렌더
  if (children) {
    return (
      <div
        className={`promo-slot promo-slot--${kind}`}
        data-slot-kind={kind}
      >
        {children}
      </div>
    )
  }

  // placeholder 시각 박스
  return (
    <div
      className="promo-slot promo-slot--placeholder"
      data-slot-kind="placeholder"
      style={{
        border: '1px dotted #BFBFBF',
        padding: '2.5rem 1.5rem',
        margin: '1.5rem 0',
        textAlign: 'center',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '11px',
        letterSpacing: '0.15em',
        color: '#999999',
        textTransform: 'uppercase',
        background: 'transparent',
      }}
      aria-label="광고 또는 프로모션 슬롯 자리"
    >
      [ 광고 / 시즌 슬롯 ]
    </div>
  )
}
