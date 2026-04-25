import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Stat } from '../components/Stat'
import { ErrorView } from '../components/Loading'
import { dashboardApi, type RealtimeData } from '../lib/dashboard-api'
import { fmt } from '../lib/format'

export function Realtime() {
  const [data, setData] = useState<RealtimeData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const tick = () => {
      dashboardApi
        .realtime()
        .then((d) => alive && setData(d))
        .catch((e) => alive && setError(String(e)))
    }
    tick()
    const id = setInterval(tick, 5000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  if (error) return <ErrorView error={error} />
  if (!data) return <div style={{ color: 'var(--text-tertiary)' }}>연결 중…</div>

  return (
    <>
      <PageHeader
        title="Realtime"
        subtitle="5초 폴링 — 최근 30분 활동"
        right={
          <span
            className="flex items-center gap-2 text-xs"
            style={{ color: 'var(--success)' }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--success)' }}
            />
            LIVE
          </span>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="현재 접속" value={data.activeUsers} suffix="명" />
        <Stat label="1시간 PV" value={data.lastHour.pageviews} />
        <Stat label="1시간 클릭" value={data.lastHour.clicks} />
      </div>

      <section>
        <div className="stat-label mb-3">최근 이벤트</div>
        <div className="card overflow-hidden" style={{ padding: 0 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {data.recentEvents.map((e, i) => (
              <li
                key={i}
                style={{
                  borderBottom:
                    i < data.recentEvents.length - 1
                      ? '1px solid var(--border-soft)'
                      : 'none',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 13,
                  color: 'var(--text-primary)',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: e.type === 'click' ? 'var(--accent)' : 'var(--text-tertiary)',
                    flexShrink: 0,
                  }}
                />
                <span className="text-xs num" style={{ color: 'var(--text-tertiary)', width: 64 }}>
                  {fmt.relativeTime(e.ts)}
                </span>
                <span
                  className="text-xs uppercase"
                  style={{ color: 'var(--text-tertiary)', width: 64 }}
                >
                  {e.type}
                </span>
                <span className="flex-1 truncate">
                  {e.type === 'click'
                    ? `${e.partner_id} ← ${e.article_slug || '?'}`
                    : e.path}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {e.country || '?'} · {e.device || '?'}
                </span>
              </li>
            ))}
            {data.recentEvents.length === 0 && (
              <li
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: 'var(--text-tertiary)',
                }}
              >
                아직 이벤트 없음
              </li>
            )}
          </ul>
        </div>
      </section>
    </>
  )
}
