/**
 * 발행 API.
 *
 * POST /api/admin/articles/:id/publish
 *   body: { autoPush?: boolean }   // 명시 안 하면 ADMIN_AUTO_PUSH 환경변수 따름
 *   응답: PublishResult (publisher.ts)
 *
 * 안전장치:
 *   - draft.status='ready' 만 허용 (publisher 가 다시 검증)
 *   - 동시 발행 방지 (인메모리 lock)
 *   - autoPush 명시 false 면 환경변수보다 우선 (commit 만)
 */
import { Router } from 'express'
import { getDb } from '../lib/db.ts'
import { publishDraft } from '../lib/publisher.ts'

export const articlesPublishRouter = Router()

const inflight = new Set<string>()

articlesPublishRouter.post('/:id/publish', async (req, res) => {
  const draftId = req.params.id as string
  if (inflight.has(draftId)) {
    return res.status(409).json({ success: false, error: 'publish_already_in_progress' })
  }
  inflight.add(draftId)

  try {
    const body = (req.body ?? {}) as { autoPush?: unknown }
    const autoPush = typeof body.autoPush === 'boolean' ? body.autoPush : undefined

    const result = await publishDraft(draftId, getDb(), { autoPush })
    if (!result.success) {
      return res.status(400).json(result)
    }
    res.json(result)
  } catch (err) {
    console.error('[publish]', err)
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    })
  } finally {
    inflight.delete(draftId)
  }
})
