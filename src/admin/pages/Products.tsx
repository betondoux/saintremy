import { useState } from 'react'
import { LocalPreviewBanner } from '../components/LocalPreviewBanner'
import { PageHeader } from '../components/PageHeader'
import { DataTable, type Column } from '../components/DataTable'
import { Loading, ErrorView } from '../components/Loading'
import { dashboardApi, type ProductRow } from '../lib/dashboard-api'
import { useFetch } from '../lib/useFetch'
import { fmt } from '../lib/format'

export function Products() {
  const [days, setDays] = useState(30)
  const { data, error, loading } = useFetch(() => dashboardApi.products(days), [days])
  if (loading) return <Loading />
  if (error) return <ErrorView error={error} />
  const rows = data?.rows || []

  const columns: Column<ProductRow>[] = [
    {
      key: 'name',
      label: '제품',
      render: (r) => (
        <>
          <div className="truncate" style={{ maxWidth: 380 }}>{r.name}</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {r.brand ?? '—'} · {r.category}
          </div>
        </>
      ),
    },
    {
      key: 'byPartner',
      label: '파트너별 클릭',
      render: (r) => (
        <div className="flex gap-2 flex-wrap">
          {r.byPartner.map((p) => (
            <span
              key={p.partner_id}
              style={{
                fontSize: 11,
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                borderRadius: 4,
                padding: '2px 8px',
                border: '1px solid var(--border)',
              }}
              title={`${p.partner_id}: ${fmt.krw(p.revenue)}`}
            >
              {p.partner_id} {fmt.n(p.clicks)}
            </span>
          ))}
        </div>
      ),
    },
    { key: 'clicks', label: '총 클릭', align: 'right', render: (r) => fmt.n(r.clicks) },
    { key: 'revenue', label: '수익', align: 'right', render: (r) => fmt.krw(r.revenue) },
  ]

  return (
    <>
      <LocalPreviewBanner />
      <PageHeader
        title="Products"
        subtitle={`제품별 성과 — 최근 ${days}일`}
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
      <DataTable
        columns={columns}
        rows={rows}
        emptyText="발행된 기사의 제품이 자동으로 표시됩니다 — 아직 데이터 없음"
      />
    </>
  )
}
