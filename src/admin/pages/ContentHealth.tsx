import { PageHeader } from '../components/PageHeader'
import { Loading, ErrorView } from '../components/Loading'
import { dashboardApi } from '../lib/dashboard-api'
import { useFetch } from '../lib/useFetch'

export function ContentHealth() {
  const { data, error, loading } = useFetch(() => dashboardApi.contentHealth(), [])
  if (loading) return <Loading />
  if (error) return <ErrorView error={error} />
  if (!data) return null

  return (
    <>
      <PageHeader
        title="Content Health"
        subtitle="깨진 링크 · 제품 미연결 · 오래된 기사"
      />

      <div className="space-y-6">
        <section>
          <div className="stat-label mb-3">
            깨진 제휴 링크 ({data.brokenLinks.length})
          </div>
          {data.brokenLinks.length === 0 ? (
            <div className="card" style={{ color: 'var(--success)' }}>모두 정상 ✓</div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {data.brokenLinks.map((b, i) => (
                  <li
                    key={i}
                    style={{
                      borderBottom:
                        i < data.brokenLinks.length - 1
                          ? '1px solid var(--border-soft)'
                          : 'none',
                      padding: '10px 16px',
                      display: 'flex',
                      gap: 12,
                      fontSize: 13,
                    }}
                  >
                    <span className="num" style={{ color: 'var(--error)', width: 48 }}>
                      {b.status}
                    </span>
                    <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                      {b.slug}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {b.partner}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <div className="stat-label mb-3">
            제품 미연결 기사 ({data.missingProducts.length})
          </div>
          {data.missingProducts.length === 0 ? (
            <div className="card" style={{ color: 'var(--success)' }}>모두 연결됨 ✓</div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {data.missingProducts.map((m, i) => (
                  <li
                    key={i}
                    style={{
                      borderBottom:
                        i < data.missingProducts.length - 1
                          ? '1px solid var(--border-soft)'
                          : 'none',
                      padding: '10px 16px',
                      fontSize: 13,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span style={{ color: 'var(--warn)', marginRight: 8 }}>⚠</span>
                    {m.slug}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <div className="stat-label mb-3">
            오래된 기사 ({data.staleArticles.length})
          </div>
          {data.staleArticles.length === 0 ? (
            <div className="card" style={{ color: 'var(--success)' }}>모두 활발함 ✓</div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {data.staleArticles.map((s, i) => (
                  <li
                    key={i}
                    style={{
                      borderBottom:
                        i < data.staleArticles.length - 1
                          ? '1px solid var(--border-soft)'
                          : 'none',
                      padding: '10px 16px',
                      display: 'flex',
                      gap: 12,
                      fontSize: 13,
                    }}
                  >
                    <span
                      className="num"
                      style={{ color: 'var(--text-tertiary)', width: 64 }}
                    >
                      {s.days_since_view}일
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{s.slug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
