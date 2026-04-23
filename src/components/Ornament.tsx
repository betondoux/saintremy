// src/components/Ornament.tsx
// 활판 인쇄 오너먼트 섹션 구분자. 3개 섹션에 1번 규칙 (과용 금지).

type OrnamentSymbol = '❦' | '✦' | '❧' | '⁂' | '◆' | '❖'

type Props = { symbol?: OrnamentSymbol }

export default function Ornament({ symbol = '❦' }: Props) {
  return (
    <div
      className="flex items-center justify-center my-16"
      aria-hidden="true"
    >
      <div
        className="flex-1 max-w-[120px] border-t"
        style={{ borderColor: 'var(--sr-rule)' }}
      />
      <span
        className="mx-6"
        style={{
          fontFamily: 'var(--font-serif-kr)',
          fontSize: '20px',
          color: 'var(--sr-muted)',
        }}
      >
        {symbol}
      </span>
      <div
        className="flex-1 max-w-[120px] border-t"
        style={{ borderColor: 'var(--sr-rule)' }}
      />
    </div>
  )
}
