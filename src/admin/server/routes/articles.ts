/**
 * /api/admin/articles
 *
 * POST  → 새 드래프트 생성 (Day 1: INSERT만, Day 2~ 에이전트 연동)
 * GET /:id → 드래프트 단건 조회 (Day 2 progress 페이지용 placeholder)
 */
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getDb } from '../lib/db.ts'

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
  res.json({ draft: row })
})
