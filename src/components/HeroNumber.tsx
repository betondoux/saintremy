// src/components/HeroNumber.tsx
// 타이포 그래픽 — 거대 숫자를 비주얼 요소로 사용.

type Props = {
  number: number | string
  kicker?: string
  caption?: string
}

export default function HeroNumber({ number, kicker, caption }: Props) {
  return (
    <div className="text-center py-12">
      {kicker && (
        <div
          className="mb-4"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.3em',
            color: 'var(--sr-muted)',
          }}
        >
          — {kicker} —
        </div>
      )}
      <div
        style={{
          fontFamily: 'var(--font-display-en)',
          fontWeight: 700,
          fontStyle: 'italic',
          fontSize: 'var(--fs-hero-num)',
          lineHeight: 0.9,
          color: 'var(--sr-ink)',
          letterSpacing: '-0.04em',
        }}
      >
        {number}
      </div>
      {caption && (
        <div
          className="mt-4"
          style={{
            fontFamily: 'var(--font-body-kr)',
            fontSize: 'var(--fs-meta)',
            color: 'var(--sr-muted)',
          }}
        >
          {caption}
        </div>
      )}
    </div>
  )
}
