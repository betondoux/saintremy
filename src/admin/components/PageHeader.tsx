import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <header className="flex items-end justify-between mb-8 gap-6 flex-wrap">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex gap-2">{right}</div>}
    </header>
  )
}
