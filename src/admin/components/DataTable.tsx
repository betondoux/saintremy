import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right'
  width?: string
}

export function DataTable<T>({
  columns,
  rows,
  emptyText = '데이터 없음',
}: {
  columns: Column<T>[]
  rows: T[]
  emptyText?: string
}) {
  if (!rows || rows.length === 0) {
    return (
      <div
        className="card text-center py-12"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {emptyText}
      </div>
    )
  }
  return (
    <div className="card overflow-x-auto" style={{ padding: 0 }}>
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-tertiary)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 font-medium ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: i < rows.length - 1 ? '1px solid var(--border-soft)' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 ${c.align === 'right' ? 'text-right num' : ''}`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
