// src/components/article/Gist.tsx
// "THE GIST" 박스 — 기사 상단 3줄 요약 (cream bg + ink left rail).

export default function Gist({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <section
      className="p-6 my-8"
      style={{
        backgroundColor: '#F4EFE8',
        borderLeft: '2px solid #0A0A0B',
      }}
    >
      <div
        className="font-bold mb-4"
        style={{
          fontSize: '11px',
          letterSpacing: '0.25em',
          color: '#0A0A0B',
        }}
      >
        THE GIST
      </div>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden
              style={{ color: '#A8A49F', fontWeight: 600 }}
            >
              —
            </span>
            <span
              style={{
                color: '#2A2724',
                fontSize: '15px',
                lineHeight: 1.65,
              }}
            >
              {it}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
