/**
 * /api/admin/articles
 *
 * POST  /                   → 새 드래프트 생성. ADMIN_AUTO_START=true 면 즉시 파이프라인 시작.
 * GET   /:id                → 드래프트 단건 조회 (단계별 결과 포함)
 * POST  /:id/start          → 수동 파이프라인 시작 / 재시작
 * GET   /:id/stream         → SSE 진행 스트림 (없으면 자동 시작)
 */
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from '../lib/db.ts'
import { getChannel, isRunning, startJob, type JobEvent } from '../lib/jobs-queue.ts'
import { getJobCost } from '../lib/cost-tracker.ts'

export const articlesRouter = Router()

const VALID_CATEGORIES = new Set([
  'gift',
  'deal',
  'style',
  'beauty',
  'space',
  'kitchen',
  'move',
  'travel',
  'furniture',
  'living',
])

const VALID_FORMATS = new Set(['best-in-class', 'showcase', 'this-thing', 'gift-guide'])

const VALID_CHANNELS = new Set(['coupang', 'oliveyoung', 'ohou', 'naver'])

type Body = {
  topic?: unknown
  category?: unknown
  format?: unknown
  channels?: unknown
  price_min?: unknown
  price_max?: unknown
  custom_instructions?: unknown
}

function s(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  if (trimmed.length === 0) return null
  return trimmed.slice(0, max)
}

articlesRouter.post('/', (req, res) => {
  const body = (req.body ?? {}) as Body

  const topic = s(body.topic, 100)
  const category = typeof body.category === 'string' ? body.category : ''
  const format = typeof body.format === 'string' ? body.format : ''
  const customInstructions = s(body.custom_instructions, 500)

  if (!topic) return res.status(400).json({ error: 'topic_required' })
  if (!VALID_CATEGORIES.has(category)) return res.status(400).json({ error: 'invalid_category' })
  if (!VALID_FORMATS.has(format)) return res.status(400).json({ error: 'invalid_format' })

  const channels = Array.isArray(body.channels) ? body.channels.filter((c) => typeof c === 'string') : []
  const validChannels = channels.filter((c) => VALID_CHANNELS.has(c))
  if (validChannels.length === 0) return res.status(400).json({ error: 'channels_required' })

  const priceMin = typeof body.price_min === 'number' && Number.isFinite(body.price_min) ? body.price_min : null
  const priceMax = typeof body.price_max === 'number' && Number.isFinite(body.price_max) ? body.price_max : null
  const priceRange = priceMin !== null || priceMax !== null
    ? JSON.stringify({ min: priceMin, max: priceMax })
    : null

  const id = uuid()
  const db = getDb()
  db.prepare(
    `INSERT INTO drafts (id, topic, category, format, channels, price_range, custom_instructions, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
  ).run(id, topic, category, format, JSON.stringify(validChannels), priceRange, customInstructions)

  if (process.env.ADMIN_AUTO_START === 'true') {
    startJob(id)
  }

  res.status(201).json({
    id,
    redirect: `/admin/articles/${id}/progress`,
  })
})

articlesRouter.get('/:id', (req, res) => {
  const row = getDb()
    .prepare('SELECT * FROM drafts WHERE id = ?')
    .get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })
  const cost = getJobCost(req.params.id)
  res.json({ draft: row, cost, running: isRunning(req.params.id) })
})

articlesRouter.post('/:id/start', (req, res) => {
  const draftId = req.params.id
  const draft = getDb().prepare('SELECT id, status FROM drafts WHERE id = ?').get(draftId)
  if (!draft) return res.status(404).json({ error: 'not_found' })
  if (isRunning(draftId)) {
    return res.status(409).json({ error: 'already_running' })
  }
  startJob(draftId)
  res.json({ ok: true, draftId })
})

articlesRouter.get('/:id/stream', (req, res) => {
  const draftId = req.params.id
  const draft = getDb().prepare('SELECT id FROM drafts WHERE id = ?').get(draftId)
  if (!draft) return res.status(404).json({ error: 'not_found' })

  // ─── SSE 헤더 ──────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  res.write('event: connected\ndata: {}\n\n')

  // 채널 가져오기 (없으면 시작)
  let channel = getChannel(draftId)
  if (!channel) channel = startJob(draftId)

  // 늦게 붙은 클라이언트 — 누적 history 재생
  for (const ev of channel.history) {
    res.write(`event: ${ev.type}\ndata: ${JSON.stringify(ev.data)}\n\n`)
  }

  // 이미 종료된 채널이면 즉시 닫기
  if (channel.finished) {
    res.end()
    return
  }

  const onEvent = (type: JobEvent['type']) => (data: Record<string, unknown>) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)
    if (type === 'done' || type === 'error') {
      res.end()
    }
  }

  const onProgress = onEvent('progress')
  const onDone = onEvent('done')
  const onError = onEvent('error')

  channel.on('progress', onProgress)
  channel.on('done', onDone)
  channel.on('error', onError)

  // 30s ping (proxy timeout 방지)
  const ping = setInterval(() => {
    res.write(': ping\n\n')
  }, 30_000)

  const cleanup = () => {
    clearInterval(ping)
    channel?.off('progress', onProgress)
    channel?.off('done', onDone)
    channel?.off('error', onError)
  }
  req.on('close', cleanup)
  res.on('close', cleanup)
})
