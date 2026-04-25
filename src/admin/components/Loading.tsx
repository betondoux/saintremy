export function Loading() {
  return (
    <div
      className="flex items-center justify-center py-24"
      style={{ color: 'var(--text-tertiary)' }}
    >
      <div className="animate-pulse">불러오는 중…</div>
    </div>
  )
}

export function ErrorView({ error }: { error: string }) {
  return (
    <div
      className="card"
      style={{
        borderColor: 'rgba(239, 68, 68, 0.4)',
        background: 'rgba(239, 68, 68, 0.08)',
        color: 'var(--error)',
      }}
    >
      <div className="font-semibold mb-1">에러</div>
      <div className="text-sm">{error}</div>
    </div>
  )
}
