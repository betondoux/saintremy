import { fmt } from '../lib/format'

interface StatProps {
  label: string
  value: number
  format?: 'n' | 'krw' | 'pct' | 'sec'
  delta?: number
  suffix?: string
}

export function Stat({ label, value, format = 'n', delta, suffix }: StatProps) {
  const formatted =
    format === 'krw'
      ? fmt.krw(value)
      : format === 'pct'
        ? fmt.pct(value)
        : format === 'sec'
          ? fmt.sec(value)
          : fmt.n(value)

  const d = delta !== undefined ? fmt.delta(value, delta) : null
  const up = d && d.value >= 0

  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-2">
        {formatted}
        {suffix && (
          <span style={{ color: 'var(--text-tertiary)', fontSize: 16, marginLeft: 4 }}>
            {suffix}
          </span>
        )}
      </div>
      {d && (
        <div
          className="text-sm mt-1 num"
          style={{ color: up ? 'var(--success)' : 'var(--error)' }}
        >
          {up ? '▲' : '▼'} {d.label}
          <span style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>vs 어제</span>
        </div>
      )}
    </div>
  )
}
