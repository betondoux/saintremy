import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Loading, ErrorView } from '../components/Loading'
import { dashboardApi } from '../lib/dashboard-api'
import { useFetch } from '../lib/useFetch'
import { fmt } from '../lib/format'

export function Funnel() {
  const [days, setDays] = useState(30)
  const { data, error, loading } = useFetch(() => dashboardApi.funnel(days), [days])
  if (loading) return <Loading />
  if (error) return <ErrorView error={error} />
  if (!data) return null

  const maxV = Math.max(...data.stages.map((s) => s.value), 1)

  return (
    <>
      <PageHeader
        title="Funnel"
        subtitle={`기사 조회 → 클릭 → 구매 확정 — 최근 ${days}일`}
        right={
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 13,
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          >
            <option value={7}>7일</option>
            <option value={30}>30일</option>
            <option value={90}>90일</option>
          </select>
        }
      />

      <div className="card space-y-5">
        {data.stages.map((s) => (
          <div key={s.name}>
            <div className="flex justify-between mb-1.5 text-sm">
              <span style={{ color: 'var(--text-primary)' }}>{s.name}</span>
              <span className="num" style={{ color: 'var(--text-secondary)' }}>
                {fmt.n(s.value)}{' '}
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  ({fmt.pct(s.rate)})
                </span>
              </span>
            </div>
            <div
              style={{
                height: 32,
                background: 'var(--bg-elevated)',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'var(--accent)',
                  width: `${(s.value / maxV) * 100}%`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
        <p className="mb-2">
          <strong style={{ color: 'var(--text-secondary)' }}>참고:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            퍼널 단계는{' '}
            <code>pageviews → product impressions → clicks → confirmed conversions</code>{' '}
            순
          </li>
          <li>구매 확정은 파트너사 API/CSV로 수집되므로 지연 있음 (보통 1~45일)</li>
          <li>제품 임프레션은 기사 내 제품 카드가 뷰포트에 진입한 횟수 (Phase 3)</li>
        </ul>
      </div>
    </>
  )
}
