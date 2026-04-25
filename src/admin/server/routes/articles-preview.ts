/**
 * 미리보기 + 발행 전 관련 API.
 *
 * GET   /api/admin/articles/:id/preview          → 드래프트 전체 (markdown + 메타 + 검증결과)
 * POST  /api/admin/articles/:id/validate-links   → 어필리에이트 URL 일괄 검증, link_validation 저장
 *
 * 발행 자체는 articles-publish.ts.
 */
import { Router } from 'express'
import { getDb } from '../lib/db.ts'
import { validateAllLinks } from '../lib/link-validator.ts'

export const articlesPreviewRouter = Router()

type DraftRow = {
  id: string
  topic: string
  category: string
  format: string
  status: string
  step_intake: string | null
  step_trends: string | null
  step_picks: string | null
  step_body_md: string | null
  step_compliance: string | null
  step_seo: string | null
  link_validation: string | null
  publish_path: string | null
  publish_commit: string | null
  published_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

function parseJSON<T>(s: string | null): T | null {
  if (!s) return null
  try {
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

// product-vetter 의 parsed payload 는 보통 { products: [...] } 또는 { picks: [...] }
// 객체이고, 가끔 raw array 일 수도 있다. 프론트가 .filter() 를 호출할 수 있도록 항상 배열로 정규화.
function normalizePicks(s: string | null): unknown[] {
  const parsed = parseJSON<unknown>(s)
  if (Array.isArray(parsed)) return parsed
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    if (Array.isArray(obj.products)) return obj.products
    if (Array.isArray(obj.picks)) return obj.picks
  }
  return []
}

articlesPreviewRouter.get('/:id/preview', (req, res) => {
  const draft = getDb()
    .prepare('SELECT * FROM drafts WHERE id = ?')
    .get(req.params.id) as DraftRow | undefined
  if (!draft) return res.status(404).json({ error: 'not_found' })

  res.json({
    id: draft.id,
    topic: draft.topic,
    category: draft.category,
    format: draft.format,
    status: draft.status,
    bodyMd: draft.step_body_md ?? '',
    seo: parseJSON<Record<string, unknown>>(draft.step_seo),
    picks: normalizePicks(draft.step_picks),
    compliance: parseJSON<Record<string, unknown>>(draft.step_compliance),
    linkValidation: parseJSON<Record<string, unknown>>(draft.link_validation),
    publishPath: draft.publish_path,
    publishCommit: draft.publish_commit,
    publishedUrl: draft.published_url,
    publishedAt: draft.published_at,
    createdAt: draft.created_at,
    updatedAt: draft.updated_at,
  })
})

articlesPreviewRouter.post('/:id/validate-links', async (req, res) => {
  const draftId = req.params.id
  const draft = getDb()
    .prepare('SELECT step_picks FROM drafts WHERE id = ?')
    .get(draftId) as { step_picks: string | null } | undefined
  if (!draft) return res.status(404).json({ error: 'not_found' })

  const picks = normalizePicks(draft.step_picks)
  const summary = await validateAllLinks(picks)
  getDb()
    .prepare('UPDATE drafts SET link_validation = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(JSON.stringify(summary), draftId)

  res.json(summary)
})
