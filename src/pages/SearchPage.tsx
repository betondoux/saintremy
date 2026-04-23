import { Link } from 'react-router-dom'

// 검색 기능 플레이스홀더 — 실제 구현은 별도 세션.
export function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          letterSpacing: '0.3em',
          color: 'var(--sr-muted)',
          marginBottom: '16px',
        }}
      >
        — SEARCH —
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-serif-kr)',
          fontSize: 'var(--fs-h1)',
          fontWeight: 700,
          color: 'var(--sr-ink)',
        }}
      >
        검색 기능이 곧 공개됩니다
      </h1>
      <p
        className="mt-4"
        style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--sr-muted)',
          lineHeight: 1.6,
        }}
      >
        Saint-Rémy 전체 아카이브에서 키워드로 찾는 기능을 준비 중입니다.
      </p>
      <div className="mt-10">
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.2em',
            color: 'var(--sr-muted)',
          }}
          className="underline hover:opacity-70 transition"
        >
          ← 홈으로
        </Link>
      </div>
    </div>
  )
}
