import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminFetch, AdminApiError } from '../lib/api'

type Step = 'intake' | 'trends' | 'vetting' | 'copy' | 'compliance' | 'seo'
type StepStatus = 'pending' | 'running' | 'done' | 'failed'

const STEPS: { key: Step; label: string; running: string }[] = [
  { key: 'intake', label: '편집장 5-point 검토', running: '편집장 검토 중…' },
  { key: 'trends', label: '트렌드 발견', running: '트렌드 탐색 중…' },
  { key: 'vetting', label: '제품 6-gate 검증', running: '제품 검증 중…' },
  { key: 'copy', label: '본문 작성 (한국어)', running: '본문 작성 중…' },
  { key: 'compliance', label: '어필리에이트 공시', running: '컴플라이언스 검사 중…' },
  { key: 'seo', label: 'SEO 메타 / OG / JSON-LD', running: 'SEO 메타 생성 중…' },
]

type Draft = {
  id: string
  topic: string
  category: string
  format: string
  status: string
  step_intake?: string | null
  step_trends?: string | null
  step_picks?: string | null
  step_body_md?: string | null
  step_compliance?: string | null
  step_seo?: string | null
}

type DraftResponse = { draft: Draft; cost: number; running: boolean }

type ProgressEvent = {
  step: Step
  status: 'running' | 'done'
  progress: number
  mock?: boolean
  cost?: number
}

type DoneEvent = { draftId: string; totalCost: number }
type ErrorEvent = { step?: Step; message: string; stack?: string }

type LogLine = { ts: string; line: string }

export function ArticleProgress() {
  const { id } = useParams<{ id: string }>()
  const draftId = id!

  const [draft, setDraft] = useState<Draft | null>(null)
  const [progress, setProgress] = useState(0)
  const [stepStatuses, setStepStatuses] = useState<Record<Step, StepStatus>>({
    intake: 'pending',
    trends: 'pending',
    vetting: 'pending',
    copy: 'pending',
    compliance: 'pending',
    seo: 'pending',
  })
  const [currentLabel, setCurrentLabel] = useState('대기 중…')
  const [error, setError] = useState<ErrorEvent | null>(null)
  const [done, setDone] = useState<DoneEvent | null>(null)
  const [cost, setCost] = useState(0)
  const [logs, setLogs] = useState<LogLine[]>([])

  const logsRef = useRef<HTMLPreElement | null>(null)

  const log = (line: string) => {
    setLogs((prev) => {
      const next = [...prev, { ts: new Date().toLocaleTimeString(), line }]
      return next.slice(-200) // 마지막 200줄만 유지
    })
  }

  // 1. 메타 로드
  useEffect(() => {
    adminFetch<DraftResponse>(`/api/admin/articles/${draftId}`)
      .then((r) => {
        setDraft(r.draft)
        setCost(r.cost)
        if (r.draft.status === 'ready') {
          setDone({ draftId, totalCost: r.cost })
          setProgress(1)
          setStepStatuses({
            intake: 'done',
            trends: 'done',
            vetting: 'done',
            copy: 'done',
            compliance: 'done',
            seo: 'done',
          })
          setCurrentLabel('완료')
        } else if (r.draft.status === 'failed') {
          setError({ message: '파이프라인이 실패 상태입니다. 재시도 가능.' })
          setCurrentLabel('실패')
        }
      })
      .catch((e) => {
        if (e instanceof AdminApiError) setError({ message: `드래프트 로드 실패: ${e.message}` })
        else setError({ message: '드래프트 로드 네트워크 오류' })
      })
  }, [draftId])

  // 2. SSE 연결 — done/failed 가 아닐 때만
  useEffect(() => {
    if (!draft) return
    if (draft.status === 'ready') return
    if (draft.status === 'failed' && !error) return // failed 인데 재시도 트리거 없으면 skip

    const evt = new EventSource(`/api/admin/articles/${draftId}/stream`)
    log('SSE 연결 시도…')

    evt.addEventListener('connected', () => log('SSE 연결됨'))
    evt.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as ProgressEvent
        log(`progress ${data.step}=${data.status} (${Math.round(data.progress * 100)}%)${data.mock ? ' [mock]' : ''}`)
        setProgress(data.progress)
        setStepStatuses((prev) => ({ ...prev, [data.step]: data.status === 'running' ? 'running' : 'done' }))
        if (data.status === 'running') {
          setCurrentLabel(STEPS.find((s) => s.key === data.step)?.running ?? data.step)
        }
        if (typeof data.cost === 'number' && data.cost > 0) {
          setCost((c) => c + data.cost!)
        }
      } catch (err) {
        log(`progress parse error: ${(err as Error).message}`)
      }
    })
    evt.addEventListener('done', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as DoneEvent
        log(`done totalCost=$${data.totalCost.toFixed(4)}`)
        setDone(data)
        setCost(data.totalCost)
        setProgress(1)
        setCurrentLabel('완료')
      } catch {
        setDone({ draftId, totalCost: cost })
      }
      evt.close()
    })
    evt.addEventListener('error', (e) => {
      const me = e as MessageEvent
      if (me.data) {
        try {
          const data = JSON.parse(me.data) as ErrorEvent
          log(`error: ${data.message}`)
          setError(data)
          if (data.step) {
            setStepStatuses((prev) => ({ ...prev, [data.step!]: 'failed' }))
          }
        } catch {
          log('error event (parse failed)')
          setError({ message: '서버에서 알 수 없는 에러' })
        }
      } else {
        log('SSE 연결 끊김')
      }
    })

    // 30분 타임아웃 보호
    const timer = setTimeout(() => {
      log('30분 타임아웃 — SSE 종료')
      evt.close()
    }, 30 * 60 * 1000)

    return () => {
      clearTimeout(timer)
      evt.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.id])

  // 로그 자동 스크롤
  useEffect(() => {
    logsRef.current?.scrollTo({ top: logsRef.current.scrollHeight })
  }, [logs])

  const pct = useMemo(() => Math.round(progress * 100), [progress])

  async function retry() {
    setError(null)
    setLogs([])
    setProgress(0)
    setStepStatuses({
      intake: 'pending',
      trends: 'pending',
      vetting: 'pending',
      copy: 'pending',
      compliance: 'pending',
      seo: 'pending',
    })
    try {
      await adminFetch(`/api/admin/articles/${draftId}/start`, { method: 'POST' })
      setCurrentLabel('재시작 중…')
      // useEffect 가 다시 SSE 붙도록 draft 재로드
      const r = await adminFetch<DraftResponse>(`/api/admin/articles/${draftId}`)
      setDraft(r.draft)
    } catch (e) {
      setError({ message: `재시작 실패: ${e instanceof Error ? e.message : String(e)}` })
    }
  }

  return (
    <>
      <div className="topbar">
        <h1>드래프트 진행 상황</h1>
        <div className="topbar-actions">
          <span className="meta">비용 누적 ${cost.toFixed(4)}</span>
          <Link className="btn btn-ghost" to="/dashboard">
            대시보드
          </Link>
        </div>
      </div>

      <div className="shell">
        {!draft && !error && <div className="alert">드래프트 불러오는 중…</div>}

        {draft && (
          <article className="form-card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 8px' }}>
              {draft.topic}
            </h2>
            <p className="meta">
              <span className="tag">{draft.category}</span>{' '}
              <span className="tag">{draft.format}</span>{' '}
              <strong>· {draft.status}</strong>
            </p>

            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: 'var(--ink-soft)',
                  marginBottom: 6,
                }}
              >
                <span>{currentLabel}</span>
                <span>{pct}%</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <ul className="step-list" style={{ marginTop: 22 }}>
              {STEPS.map((s, i) => {
                const st = stepStatuses[s.key]
                const icon =
                  st === 'done' ? '✓' : st === 'running' ? '◐' : st === 'failed' ? '✗' : '○'
                return (
                  <li key={s.key} className={`step-item step-${st}`}>
                    <span className="step-icon" aria-hidden>
                      {icon}
                    </span>
                    <span className="step-num">{i + 1}.</span>
                    <span className="step-label">{s.label}</span>
                  </li>
                )
              })}
            </ul>
          </article>
        )}

        {error && (
          <div className="alert alert-error">
            <strong>오류</strong>
            {error.step && ` · ${error.step}`}: {error.message}
            <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={retry}>
                재시도
              </button>
              <Link className="btn btn-ghost" to="/dashboard">
                대시보드로
              </Link>
            </div>
          </div>
        )}

        {done && (
          <div className="alert alert-success">
            <strong>✓ 파이프라인 완료</strong> — 총 비용 ${done.totalCost.toFixed(4)}
            <p style={{ margin: '6px 0 10px', fontSize: 13 }}>
              본문 markdown + 픽 후보 + SEO 메타가 SQLite drafts 에 저장되었습니다. Day 3 에서 링크/이미지 검증.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link className="btn btn-ghost" to="/dashboard">
                대시보드로
              </Link>
            </div>
          </div>
        )}

        <details style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-mute)' }}>
          <summary style={{ cursor: 'pointer' }}>디버그 로그 ({logs.length})</summary>
          <pre
            ref={logsRef}
            style={{
              marginTop: 8,
              padding: 10,
              background: 'rgba(0,0,0,0.04)',
              borderRadius: 6,
              maxHeight: 200,
              overflow: 'auto',
              fontSize: 11,
              whiteSpace: 'pre-wrap',
            }}
          >
            {logs.map((l, i) => (
              <div key={i}>
                <span style={{ color: 'var(--ink-mute)' }}>{l.ts}</span> {l.line}
              </div>
            ))}
          </pre>
        </details>
      </div>
    </>
  )
}
