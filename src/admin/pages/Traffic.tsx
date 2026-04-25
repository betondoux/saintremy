import { useState } from 'react'
import { LocalPreviewBanner } from '../components/LocalPreviewBanner'
import { PageHeader } from '../components/PageHeader'
import { DataTable, type Column } from '../components/DataTable'
import { Loading, ErrorView } from '../components/Loading'
import { dashboardApi, type TrafficData } from '../lib/dashboard-api'
import { useFetch } from '../lib/useFetch'
import { fmt } from '../lib/format'

export function Traffic() {
  const [days, setDays] = useState(7)
  const { data, error, loading } = useFetch(() => dashboardApi.traffic(days), [days])
  if (loading) return <Loading />
  if (error) return <ErrorView error={error} />
  if (!data) return null

  return (
    <>
      <LocalPreviewBanner />
      <PageHeader
        title="Traffic"
        subtitle={`유입 소스 · 국가 · 디바이스 — 최근 ${days}일`}
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
          </select>
        }
      />

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <div className="stat-label mb-3">유입 소스</div>
          <Sources data={data.sources} />
        </section>

        <section>
          <div className="stat-label mb-3">국가</div>
          <Countries data={data.countries} />
        </section>

        <section>
          <div className="stat-label mb-3">디바이스</div>
          <Devices data={data.devices} />
        </section>

        <section>
          <div className="stat-label mb-3">랜딩 페이지 Top</div>
          <Landings data={data.landingPages} />
        </section>
      </div>
    </>
  )
}

function Sources({ data }: { data: TrafficData['sources'] }) {
  const cols: Column<TrafficData['sources'][number]>[] = [
    { key: 'source', label: 'Source' },
    { key: 'sessions', label: '세션', align: 'right', render: (r) => fmt.n(r.sessions) },
    { key: 'clicks', label: '클릭', align: 'right', render: (r) => fmt.n(r.clicks) },
    { key: 'revenue', label: '수익', align: 'right', render: (r) => fmt.krw(r.revenue) },
  ]
  return <DataTable columns={cols} rows={data} />
}

function Countries({ data }: { data: TrafficData['countries'] }) {
  const cols: Column<TrafficData['countries'][number]>[] = [
    { key: 'country', label: '국가', render: (r) => r.country || '—' },
    { key: 'sessions', label: '세션', align: 'right', render: (r) => fmt.n(r.sessions) },
    { key: 'pageviews', label: 'PV', align: 'right', render: (r) => fmt.n(r.pageviews) },
  ]
  return <DataTable columns={cols} rows={data} />
}

function Devices({ data }: { data: TrafficData['devices'] }) {
  const cols: Column<TrafficData['devices'][number]>[] = [
    { key: 'device', label: '디바이스' },
    { key: 'sessions', label: '세션', align: 'right', render: (r) => fmt.n(r.sessions) },
    { key: 'pageviews', label: 'PV', align: 'right', render: (r) => fmt.n(r.pageviews) },
  ]
  return <DataTable columns={cols} rows={data} />
}

function Landings({ data }: { data: TrafficData['landingPages'] }) {
  const cols: Column<TrafficData['landingPages'][number]>[] = [
    { key: 'path', label: 'Path' },
    { key: 'sessions', label: '세션', align: 'right', render: (r) => fmt.n(r.sessions) },
    { key: 'avg_dwell_sec', label: '평균 체류', align: 'right', render: (r) => fmt.sec(r.avg_dwell_sec) },
  ]
  return <DataTable columns={cols} rows={data} />
}
