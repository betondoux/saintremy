import { Link } from 'react-router-dom'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { Stat } from '../components/Stat'
import { Loading, ErrorView } from '../components/Loading'
import { DataTable, type Column } from '../components/DataTable'
import { dashboardApi, type OverviewData } from '../lib/dashboard-api'
import { useFetch } from '../lib/useFetch'
import { fmt } from '../lib/format'

export function Overview() {
  const { data, error, loading } = useFetch(() => dashboardApi.overview(7), [])
  if (loading) return <Loading />
  if (error) return <ErrorView error={error} />
  if (!data) return null

  return (
    <>
      <PageHeader title="Overview" subtitle="오늘 기준 7일 트렌드 — 방문자·클릭·수익 요약" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Stat label="오늘 방문자" value={data.today.sessions} delta={data.yesterday.pageviews} />
        <Stat label="페이지뷰" value={data.today.pageviews} delta={data.yesterday.pageviews} />
        <Stat label="제휴 클릭" value={data.today.clicks} delta={data.yesterday.clicks} />
        <Stat label="CTR" value={data.today.ctr} format="pct" />
        <Stat label="예상 수익" value={data.today.revenue} format="krw" delta={data.yesterday.revenue} />
      </div>

      <section className="card mb-8">
        <div className="stat-label mb-4">7일 트렌드</div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={data.series}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A574" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#D4A574" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" tickFormatter={fmt.shortDate} />
              <YAxis stroke="#737373" />
              <Tooltip
                contentStyle={{
                  background: '#111',
                  border: '1px solid #262626',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#f5f5f5',
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString('ko-KR')}
              />
              <Area type="monotone" dataKey="pageviews" stroke="#D4A574" fill="url(#g1)" name="페이지뷰" />
              <Area type="monotone" dataKey="clicks" stroke="#22c55e" fill="url(#g2)" name="클릭" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section>
          <div className="stat-label mb-3">Top 기사 (클릭 기준)</div>
          <TopArticles rows={data.topArticles} />
        </section>
        <section>
          <div className="stat-label mb-3">파트너별 수익</div>
          <div className="card space-y-3">
            {data.topPartners.map((p) => (
              <div key={p.partner_id} className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: p.color, flexShrink: 0 }}
                />
                <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                <span className="text-xs num" style={{ color: 'var(--text-tertiary)' }}>
                  {fmt.n(p.clicks)} 클릭
                </span>
                <span className="text-sm num font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {fmt.krw(p.revenue)}
                </span>
              </div>
            ))}
            {data.topPartners.length === 0 && (
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                아직 데이터 없음
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

function TopArticles({ rows }: { rows: OverviewData['topArticles'] }) {
  const columns: Column<OverviewData['topArticles'][number]>[] = [
    {
      key: 'title',
      label: '기사',
      render: (r) => (
        <Link
          to={`/articles?slug=${r.slug}`}
          style={{ color: 'var(--text-primary)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
        >
          <div className="truncate" style={{ maxWidth: 360 }}>{r.title}</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.slug}</div>
        </Link>
      ),
    },
    { key: 'pageviews', label: 'PV', align: 'right', render: (r) => fmt.n(r.pageviews) },
    { key: 'clicks', label: '클릭', align: 'right', render: (r) => fmt.n(r.clicks) },
    { key: 'ctr', label: 'CTR', align: 'right', render: (r) => fmt.pct(r.ctr) },
    { key: 'revenue', label: '수익', align: 'right', render: (r) => fmt.krw(r.revenue) },
  ]
  return <DataTable columns={columns} rows={rows} />
}
