/**
 * Saint-Rémy Editor — 미리보기 페이지.
 *
 * 흐름: ArticleProgress 가 파이프라인 완료 (status=ready) 를 감지하면 자동 redirect.
 * 화면:
 *   1. 메타 (topic / category / format / status / 비용)
 *   2. 좌: Markdown 소스 / 우: HTML 미리보기
 *   3. 어필리에이트 링크 검증 패널 (POST /validate-links 트리거)
 *   4. SEO 패널 (slug / title / description)
 *   5. 발행 버튼 (검증 통과 + 픽 존재 시에만 활성화)
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { marked } from 'marked'
import { adminFetch, AdminApiError } from '../lib/api'

type Pick = {
  rank?: number
  name?: string
  productUrl?: string
  product_url?: string
  url?: string
  price?: string | number
  pros?: string[]
  cons?: string[]
}

type LinkResult = {
  url: string
  valid: boolean
  status?: number
  finalUrl?: string
  error?: string
  productExists?: boolean
  checkedAt: string
}

type LinkValidation = {
  allValid: boolean
  total: number
  validCount: number
  results: LinkResult[]
  checkedAt: string
}

type Seo = {
  slug?: string
  title?: string
  description?: string
  metaTitle?: string
  metaDescription?: string
  canonical?: string
  internalLinks?: Array<{ text?: string; href?: string }>
  ogImage?: string
}

type PreviewResponse = {
  id: string
  topic: string
  category: string
  format: string
  status: string
  bodyMd: string
  seo: Seo | null
  picks: Pick[] | null
  compliance: Record<string, unknown> | null
  linkValidation: LinkValidation | null
  publishPath: string | null
  publishCommit: string | null
  publishedUrl: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

type PublishResponse = {
  success: boolean
  filePath?: string
  liveUrl?: string
  commit?: string
  pushed?: boolean
  error?: string
}

marked.setOptions({ breaks: false, gfm: true })

function renderMarkdown(md: string): string {
  if (!md) return ''
  try {
    return marked.parse(md, { async: false }) as string
  } catch (err) {
    return `<pre>${(err as Error).message}</pre>`
  }
}

function pickUrl(p: Pick): string | undefined {
  return p.productUrl ?? p.product_url ?? p.url
}

export function ArticlePreview() {
  const { id } = useParams<{ id: string }>()
  const draftId = id!
  const navigate = useNavigate()

  const [draft, setDraft] = useState<PreviewResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [validating, setValidating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<PublishResponse | null>(null)

  const reload = async () => {
    try {
      const data = await adminFetch<PreviewResponse>(`/api/admin/articles/${draftId}/preview`)
      setDraft(data)
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof AdminApiError ? e.message : '드래프트 로드 실패')
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId])

  const html = useMemo(() => renderMarkdown(draft?.bodyMd ?? ''), [draft?.bodyMd])
  const validation = draft?.linkValidation ?? null

  const picksWithUrl = useMemo(() => (draft?.picks ?? []).filter(pickUrl), [draft?.picks])

  const canPublish =
    !!draft &&
    draft.status === 'ready' &&
    picksWithUrl.length > 0 &&
    validation !== null &&
    validation.allValid

  async function validateLinks() {
    if (!draft) return
    setValidating(true)
    try {
      const result = await adminFetch<LinkValidation>(
        `/api/admin/articles/${draftId}/validate-links`,
        { method: 'POST' }
      )
      setDraft({ ...draft, linkValidation: result })
    } catch (e) {
      alert(`링크 검증 실패: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setValidating(false)
    }
  }

  async function publish() {
    if (!draft) return
    if (!canPublish) {
      alert('발행 전 어필리에이트 링크 검증을 통과해야 합니다.')
      return
    }
    if (!confirm('정말 saintremy.kr 에 발행하시겠습니까?\n\n파일 저장 + git commit 이 진행됩니다 (push 는 ADMIN_AUTO_PUSH 설정에 따름).')) return
    setPublishing(true)
    try {
      const data = await adminFetch<PublishResponse>(
        `/api/admin/articles/${draftId}/publish`,
        { method: 'POST' }
      )
      setPublishResult(data)
      if (data.success) await reload()
    } catch (e) {
      const msg = e instanceof AdminApiError ? e.message : (e as Error).message
      setPublishResult({ success: false, error: msg })
    } finally {
      setPublishing(false)
    }
  }

  if (loadError) {
    return (
      <>
        <Topbar />
        <div className="shell">
          <div className="alert alert-error">{loadError}</div>
        </div>
      </>
    )
  }
  if (!draft) {
    return (
      <>
        <Topbar />
        <div className="shell">
          <div className="alert">드래프트 불러오는 중…</div>
        </div>
      </>
    )
  }

  const seo = draft.seo ?? {}
  const slug = String(seo.slug ?? '(자동 생성)')
  const seoTitle = String(seo.title ?? seo.metaTitle ?? draft.topic)
  const seoDesc = String(seo.description ?? seo.metaDescription ?? '')

  return (
    <>
      <Topbar />
      <div className="shell">
        <article className="form-card" style={{ marginBottom: 16, maxWidth: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 6px' }}>{draft.topic}</h2>
              <p className="meta">
                <span className="tag">{draft.category}</span> <span className="tag">{draft.format}</span>{' '}
                <strong>· {draft.status}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link className="btn btn-ghost" to={`/articles/${draftId}/progress`}>
                진행 화면
              </Link>
              <Link className="btn btn-ghost" to="/dashboard">
                대시보드
              </Link>
            </div>
          </div>
        </article>

        {draft.publishedUrl && (
          <div className="alert alert-success">
            <strong>이미 발행됨</strong> —{' '}
            <a href={draft.publishedUrl} target="_blank" rel="noreferrer">
              {draft.publishedUrl}
            </a>
            {draft.publishedAt && <> · {new Date(draft.publishedAt).toLocaleString('ko-KR')}</>}
            {draft.publishCommit && <> · commit <code>{draft.publishCommit.slice(0, 7)}</code></>}
          </div>
        )}

        {/* 좌: Markdown / 우: HTML 미리보기 */}
        <div className="preview-grid">
          <section className="preview-col">
            <h3 className="preview-col-head">Markdown 소스</h3>
            <pre className="preview-md">{draft.bodyMd || '(본문 없음 — 파이프라인을 끝까지 실행하세요)'}</pre>
          </section>
          <section className="preview-col">
            <h3 className="preview-col-head">미리보기 (HTML)</h3>
            <div className="preview-rendered" dangerouslySetInnerHTML={{ __html: html }} />
          </section>
        </div>

        {/* 픽 + 어필리에이트 링크 검증 */}
        <section className="preview-panel">
          <div className="preview-panel-head">
            <h3>어필리에이트 링크 검증 ({picksWithUrl.length}개)</h3>
            <button className="btn btn-primary" onClick={validateLinks} disabled={validating || picksWithUrl.length === 0}>
              {validating ? '검증 중…' : validation ? '재검증' : '검증 시작'}
            </button>
          </div>
          {picksWithUrl.length === 0 && (
            <p className="meta">픽에 productUrl 이 없습니다. (compliance / vetting 단계 결과 확인)</p>
          )}
          {validation && (
            <ul className="validation-list">
              {validation.results.map((r, i) => (
                <li key={i} className={r.valid ? 'validation-ok' : 'validation-bad'}>
                  <span className="validation-icon">{r.valid ? '✓' : '✗'}</span>
                  <a href={r.url} target="_blank" rel="noreferrer" className="validation-url">
                    {r.url}
                  </a>
                  <span className="validation-status">
                    {r.valid ? `HTTP ${r.status ?? '?'}` : r.error ?? `HTTP ${r.status ?? '?'}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {validation && !validation.allValid && (
            <div className="alert alert-error" style={{ marginTop: 10 }}>
              {validation.total - validation.validCount}/{validation.total} 링크가 실패했습니다. 발행 차단됨.
            </div>
          )}
        </section>

        {/* SEO 메타 */}
        <section className="preview-panel">
          <h3 style={{ margin: '0 0 10px' }}>SEO</h3>
          <dl className="kv">
            <dt>Slug</dt>
            <dd>
              <code>{slug}</code> →{' '}
              <code>
                /{draft.category}/{slug}
              </code>
            </dd>
            <dt>Title</dt>
            <dd>{seoTitle}</dd>
            <dt>Description</dt>
            <dd className="meta">{seoDesc || '(없음)'}</dd>
          </dl>
        </section>

        {/* 발행 액션 */}
        <section className="preview-actions">
          <button className="btn btn-primary" onClick={publish} disabled={!canPublish || publishing}>
            {publishing ? '발행 중…' : '🚀 발행 (saintremy.kr)'}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate(`/articles/${draftId}/progress`)}>
            진행 화면으로
          </button>
          <Link className="btn btn-ghost" to="/dashboard">
            취소
          </Link>
          {!canPublish && (
            <span className="meta">
              {draft.status !== 'ready' && '· 파이프라인이 아직 완료되지 않음 '}
              {picksWithUrl.length === 0 && '· 픽에 productUrl 없음 '}
              {!validation && '· 링크 검증 필요 '}
              {validation && !validation.allValid && '· 링크 검증 실패 '}
            </span>
          )}
        </section>

        {publishResult && (
          <div
            className={publishResult.success ? 'alert alert-success' : 'alert alert-error'}
            style={{ marginTop: 16 }}
          >
            {publishResult.success ? (
              <>
                <strong>✓ 발행 완료</strong>
                <div style={{ marginTop: 4 }}>
                  파일: <code>{publishResult.filePath}</code>
                </div>
                {publishResult.liveUrl && (
                  <div>
                    URL:{' '}
                    <a href={publishResult.liveUrl} target="_blank" rel="noreferrer">
                      {publishResult.liveUrl}
                    </a>
                  </div>
                )}
                {publishResult.commit && (
                  <div>
                    commit: <code>{publishResult.commit.slice(0, 7)}</code>
                    {publishResult.pushed
                      ? ' · push 완료 (Cloudflare 빌드 ~2-3분)'
                      : ' · push 대기 (수동 git push 필요)'}
                  </div>
                )}
              </>
            ) : (
              <>
                <strong>✗ 발행 실패</strong>: {publishResult.error}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function Topbar() {
  return (
    <div className="topbar">
      <h1>Article Preview</h1>
      <div className="topbar-actions">
        <Link className="btn btn-ghost" to="/dashboard">
          대시보드
        </Link>
      </div>
    </div>
  )
}
