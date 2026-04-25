import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminFetch } from '../lib/api'

type Draft = {
  id: string
  topic: string
  category: string
  status: string
  updated_at: string
  format: string
}

type Published = {
  slug: string
  title: string
  category: string
  published_at: string
  url: string
}

type DashboardData = {
  stats: {
    published_this_month: number
    drafts_in_progress: number
  }
  drafts: Draft[]
  published: Published[]
}

const STATUS_PROGRESS: Record<string, number> = {
  pending: 5,
  intake: 15,
  trends: 30,
  picks: 50,
  body: 70,
  compliance: 85,
  seo: 95,
  ready: 99,
  published: 100,
}

function progressPercent(status: string): number {
  return STATUS_PROGRESS[status] ?? 5
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminFetch<DashboardData>('/api/admin/dashboard')
      .then(setData)
      .catch((err) => setError(String(err?.message ?? err)))
  }, [])

  return (
    <>
      <div className="topbar">
        <h1>진행 중 (Editor)</h1>
        <div className="topbar-actions">
          <Link className="btn btn-primary" to="/new">
            + 새 기사
          </Link>
        </div>
      </div>

      <div className="shell">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats">
          <div className="stat-card">
            <p className="stat-label">이번 달 발행</p>
            <p className="stat-value">{data?.stats.published_this_month ?? '—'}편</p>
            <p className="stat-note">content/articles 기준</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">진행 중인 드래프트</p>
            <p className="stat-value">{data?.stats.drafts_in_progress ?? '—'}편</p>
            <p className="stat-note">SQLite drafts</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">트래픽</p>
            <p className="stat-value">—</p>
            <p className="stat-note">Phase 4 연동 예정</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">수수료 추정</p>
            <p className="stat-value">—</p>
            <p className="stat-note">Phase 4 연동 예정</p>
          </div>
        </div>

        <section className="section">
          <div className="section-head">
            <h2>진행 중</h2>
            <span className="meta">{data?.drafts.length ?? 0}편</span>
          </div>
          <div className="list">
            {data?.drafts.length === 0 && (
              <div className="list-empty">
                진행 중인 드래프트가 없습니다. 위 [+ 새 기사] 버튼으로 시작하세요.
              </div>
            )}
            {data?.drafts.map((d) => (
              <article className="draft-card" key={d.id}>
                <div>
                  <h3>{d.topic}</h3>
                  <p className="meta">
                    <span className="tag">{d.category}</span>{' '}
                    <span className="tag">{d.format}</span>{' '}
                    <strong>· {d.status}</strong> · 마지막 수정 {formatDate(d.updated_at)}
                  </p>
                  <div className="progress" aria-label={`진행률 ${progressPercent(d.status)}%`}>
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercent(d.status)}%` }}
                    />
                  </div>
                </div>
                <Link
                  className={`btn ${d.status === 'ready' ? 'btn-primary' : 'btn-ghost'}`}
                  to={
                    d.status === 'ready'
                      ? `/articles/${d.id}/preview`
                      : `/articles/${d.id}/progress`
                  }
                >
                  {d.status === 'ready' ? '미리보기 + 발행' : '작업 계속'}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>최근 발행</h2>
            <span className="meta">{data?.published.length ?? 0}편</span>
          </div>
          <div className="list">
            {data?.published.length === 0 && (
              <div className="list-empty">아직 발행된 기사가 없습니다.</div>
            )}
            {data?.published.map((p) => (
              <article className="published-card" key={p.slug}>
                <div>
                  <h3>{p.title}</h3>
                  <p className="meta">
                    <span className="tag">{p.category}</span> · 발행{' '}
                    {formatDate(p.published_at)} ·{' '}
                    <a href={p.url} target="_blank" rel="noreferrer">
                      {p.url}
                    </a>
                  </p>
                </div>
                <Link
                  to={`/articles?slug=${encodeURIComponent(p.slug)}`}
                  className="btn btn-ghost"
                  title="이 기사의 트래픽 보기"
                >
                  트래픽 보기 →
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
