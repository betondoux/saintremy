import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { DataTable, type Column } from '../components/DataTable'
import { Loading, ErrorView } from '../components/Loading'
import { dashboardApi, type ArticleRow } from '../lib/dashboard-api'
import { useFetch } from '../lib/useFetch'
import { fmt } from '../lib/format'

type SortKey = 'pageviews' | 'clicks' | 'ctr' | 'revenue' | 'avg_dwell_sec'

export function Articles() {
  const [searchParams] = useSearchParams()
  const slugFilter = searchParams.get('slug') || ''

  const [days, setDays] = useState(30)
  const [sort, setSort] = useState<SortKey>('revenue')
  const [q, setQ] = useState(slugFilter)
  const [category, setCategory] = useState<string>('')

  const { data, error, loading } = useFetch(() => dashboardApi.articles(days), [days])

  const sorted = useMemo(() => {
    if (!data?.rows) return []
    let rows = data.rows
    if (q) {
      const qq = q.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(qq) ||
          r.slug.toLowerCase().includes(qq),
      )
    }
    if (category) rows = rows.filter((r) => r.category === category)
    return [...rows].sort((a, b) => (b[sort] ?? 0) - (a[sort] ?? 0))
  }, [data, sort, q, category])

  if (loading) return <Loading />
  if (error) return <ErrorView error={error} />

  const columns: Column<ArticleRow>[] = [
    {
      key: 'title',
      label: '기사',
      render: (r) => (
        <>
          <div className="truncate" style={{ maxWidth: 380 }}>{r.title}</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {r.category} · {r.published || '—'}
          </div>
        </>
      ),
    },
    { key: 'pageviews', label: 'PV', align: 'right', render: (r) => fmt.n(r.pageviews) },
    { key: 'avg_dwell_sec', label: '체류', align: 'right', render: (r) => fmt.sec(r.avg_dwell_sec) },
    { key: 'avg_scroll', label: '스크롤', align: 'right', render: (r) => fmt.pct(r.avg_scroll, 0) },
    { key: 'clicks', label: '클릭', align: 'right', render: (r) => fmt.n(r.clicks) },
    { key: 'ctr', label: 'CTR', align: 'right', render: (r) => fmt.pct(r.ctr) },
    { key: 'revenue', label: '수익', align: 'right', render: (r) => fmt.krw(r.revenue) },
  ]

  const categories = Array.from(new Set(data?.rows.map((r) => r.category))).sort()
  const inputBase: React.CSSProperties = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
  }

  return (
    <>
      <PageHeader
        title="Articles"
        subtitle={`기사별 성과 — 최근 ${days}일${slugFilter ? ` · 필터: ${slugFilter}` : ''}`}
        right={
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={inputBase}
          >
            <option value={7}>7일</option>
            <option value={30}>30일</option>
            <option value={90}>90일</option>
          </select>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목/슬러그 검색…"
          style={{ ...inputBase, width: 256 }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputBase}
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>정렬:</span>
        {(['revenue', 'clicks', 'pageviews', 'ctr', 'avg_dwell_sec'] as SortKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setSort(k)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 11,
              border: 'none',
              cursor: 'pointer',
              background: sort === k ? 'var(--accent)' : 'var(--bg-elevated)',
              color: sort === k ? '#1a1208' : 'var(--text-secondary)',
              fontWeight: sort === k ? 600 : 400,
            }}
          >
            {k === 'revenue' ? '수익'
              : k === 'clicks' ? '클릭'
              : k === 'pageviews' ? 'PV'
              : k === 'ctr' ? 'CTR'
              : '체류'}
          </button>
        ))}
        <span className="text-xs ml-auto" style={{ color: 'var(--text-tertiary)' }}>
          {sorted.length}개 기사
        </span>
      </div>

      <DataTable columns={columns} rows={sorted} />
    </>
  )
}
