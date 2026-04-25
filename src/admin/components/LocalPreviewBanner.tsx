/**
 * 로컬 dev에서 dashboard 페이지가 mock 폴백을 쓸 때 표시되는 안내 배너.
 *
 * - hostname이 localhost / 127.0.0.1 / *.local 일 때만 렌더
 * - 운영(saintremy.kr/admin/*)에서는 자동 숨김
 * - 다크 톤에 어울리는 골드 외곽 + 부드러운 경고색 배경
 */
export function LocalPreviewBanner() {
  if (typeof window === 'undefined') return null
  const host = window.location.hostname
  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local')
  if (!isLocal) return null

  return (
    <div
      role="note"
      style={{
        margin: '0 0 20px',
        padding: '10px 14px',
        background: 'rgba(212, 165, 116, 0.10)',
        border: '1px solid rgba(212, 165, 116, 0.35)',
        borderRadius: 8,
        fontSize: 12.5,
        lineHeight: 1.5,
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <span style={{ color: 'var(--accent)', fontSize: 14, lineHeight: 1.2 }}>⚠</span>
      <div>
        <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          로컬 미리보기
        </strong>{' '}
        — 표시되는 모든 수치는 0이며 운영 D1에 연결되지 않았습니다. 실제
        트래픽·클릭·수익은{' '}
        <a
          href="https://saintremy.kr/admin/overview"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent)', textDecoration: 'underline' }}
        >
          saintremy.kr/admin
        </a>{' '}
        에서 확인.
      </div>
    </div>
  )
}
