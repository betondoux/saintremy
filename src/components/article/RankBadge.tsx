// src/components/article/RankBadge.tsx
// 픽 헤더 위 인라인 뱃지 ("BEST OVERALL" 등) — cream bg + ink border.

export type RankVariant =
  | 'overall'
  | 'budget'
  | 'splurge'
  | 'for'
  | 'also'
  | 'editor'

const DEFAULT_LABEL: Record<RankVariant, string> = {
  overall: 'BEST OVERALL',
  budget: 'BEST BUDGET',
  splurge: 'BEST SPLURGE',
  for: 'BEST FOR',
  also: 'ALSO GREAT',
  editor: "EDITOR'S PICK",
}

export default function RankBadge({
  variant,
  label,
}: {
  variant: RankVariant
  label?: string
}) {
  const text = label ?? DEFAULT_LABEL[variant]
  return (
    <span
      className="inline-block font-serif mb-3"
      style={{
        fontSize: '12px',
        letterSpacing: '0.2em',
        fontWeight: 700,
        padding: '6px 12px',
        backgroundColor: '#F4EFE8',
        border: '1px solid #0A0A0B',
        color: '#0A0A0B',
      }}
    >
      {text}
    </span>
  )
}
