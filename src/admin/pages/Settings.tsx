import { LocalPreviewBanner } from '../components/LocalPreviewBanner'
import { PageHeader } from '../components/PageHeader'

export function Settings() {
  return (
    <>
      <LocalPreviewBanner />
      <PageHeader
        title="Settings"
        subtitle="파트너 계정 · 수익 업로드 · 시스템 상태"
      />

      <div className="space-y-6">
        <section className="card">
          <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            파트너 계정
          </div>
          <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            각 파트너 수익 리포트를 가져오려면 API 키 또는 CSV를 등록하세요.
            Cloudflare Pages Secret 으로 저장되므로 브라우저에 노출되지 않습니다.
          </div>
          <ul className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>쿠팡 파트너스:</strong>{' '}
              <code className="text-xs">COUPANG_ACCESS_KEY</code>,{' '}
              <code className="text-xs">COUPANG_SECRET_KEY</code>
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>네이버 커넥트:</strong>{' '}
              수동 CSV 업로드 (API 확인 필요)
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>오늘의집 큐레이터:</strong>{' '}
              수동 CSV 업로드 (API 없음)
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>올리브영 큐레이터:</strong>{' '}
              수동 CSV 업로드 (API 없음)
            </li>
          </ul>
        </section>

        <section className="card">
          <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            수익 CSV 업로드
          </div>
          <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            파트너사 대시보드에서 내려받은 CSV를 업로드해 <code>conversions</code>{' '}
            테이블에 병합합니다. Phase 4에서 활성화.
          </div>
          <button
            disabled
            style={{
              padding: '8px 16px',
              background: 'var(--bg-elevated)',
              borderRadius: 6,
              border: '1px solid var(--border)',
              fontSize: 13,
              color: 'var(--text-tertiary)',
              cursor: 'not-allowed',
            }}
          >
            CSV 업로드 (준비 중)
          </button>
        </section>

        <section className="card">
          <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            시스템 상태
          </div>
          <ul
            className="text-sm space-y-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <li>- D1 database: <code>saintremy-analytics</code> (3901046c-…)</li>
            <li>- 보관 기간: 영구 (5GB 이내)</li>
            <li>- IP 처리: SHA-256 salted hash (원본 저장 안 함)</li>
            <li>- 인증: admin 세션 쿠키 (saintremy_admin_session)</li>
            <li>- API 모드: Day 2 Mock (실 호출은 Day 5+)</li>
          </ul>
        </section>
      </div>
    </>
  )
}
