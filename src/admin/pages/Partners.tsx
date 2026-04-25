import { PageHeader } from '../components/PageHeader'
import { Loading, ErrorView } from '../components/Loading'
import { dashboardApi } from '../lib/dashboard-api'
import { useFetch } from '../lib/useFetch'
import { fmt } from '../lib/format'

export function Partners() {
  const { data, error, loading } = useFetch(() => dashboardApi.partners(), [])
  if (loading) return <Loading />
  if (error) return <ErrorView error={error} />
  const rows = data?.rows || []

  return (
    <>
      <PageHeader title="Partners" subtitle="파트너별 클릭·수익·정산 현황" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((p) => (
          <div key={p.partner_id} className="card">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: p.color, flexShrink: 0 }}
              />
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {p.name}
              </div>
              <span
                className="ml-auto text-xs num"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {fmt.pct(p.commission_rate, 1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <div className="stat-label">7일 클릭</div>
                <div className="num font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {fmt.n(p.clicks_7d)}
                </div>
              </div>
              <div>
                <div className="stat-label">30일 클릭</div>
                <div className="num font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {fmt.n(p.clicks_30d)}
                </div>
              </div>
              <div>
                <div className="stat-label">7일 수익</div>
                <div className="num font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {fmt.krw(p.revenue_7d)}
                </div>
              </div>
              <div>
                <div className="stat-label">30일 수익</div>
                <div className="num font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {fmt.krw(p.revenue_30d)}
                </div>
              </div>
            </div>

            <div
              className="flex justify-between text-sm"
              style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}
            >
              <div>
                <div className="stat-label">확정</div>
                <div className="num" style={{ color: 'var(--success)' }}>
                  {fmt.krw(p.confirmed_revenue)}
                </div>
              </div>
              <div className="text-right">
                <div className="stat-label">대기</div>
                <div className="num" style={{ color: 'var(--warn)' }}>
                  {fmt.krw(p.pending_revenue)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div
          className="card text-center py-12"
          style={{ color: 'var(--text-tertiary)' }}
        >
          파트너 데이터 없음 — workers/schema.sql 시드가 적용됐는지 확인하세요.
        </div>
      )}
    </>
  )
}
