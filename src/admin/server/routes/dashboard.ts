/**
 * /api/admin/dashboard — 대시보드용 통합 데이터.
 *
 * 발행본은 SQLite drafts(status='published')와 content/articles/ 폴더 스캔을 결합.
 * 현재(Day 1)는 drafts.status='published'가 아직 채워지지 않으므로,
 * 일단 drafts 진행 중 + content/articles/ 폴더 메타데이터만 반환.
 */
import { Router } from 'express'
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { getDb } from '../lib/db.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = resolve(__dirname, '../../../../content/articles')

export const dashboardRouter = Router()

type DraftRow = {
  id: string
  topic: string
  category: string
  status: string
  format: string
  updated_at: string
}

type Published = {
  slug: string
  title: string
  category: string
  published_at: string
  url: string
}

function scanPublished(): Published[] {
  if (!existsSync(ARTICLES_DIR)) return []
  const out: Published[] = []
  for (const category of readdirSync(ARTICLES_DIR)) {
    const catDir = join(ARTICLES_DIR, category)
    let st
    try {
      st = statSync(catDir)
    } catch {
      continue
    }
    if (!st.isDirectory()) continue
    for (const entry of readdirSync(catDir)) {
      const full = join(catDir, entry)
      if (entry.startsWith('.') || entry.startsWith('_')) continue
      let entrySt
      try {
        entrySt = statSync(full)
      } catch {
        continue
      }

      let mdPath: string | null = null
      let slug = entry.replace(/\.(md|mdx)$/i, '')

      if (entrySt.isDirectory()) {
        const candidate = join(full, 'index.md')
        if (existsSync(candidate)) mdPath = candidate
      } else if (/\.(md|mdx)$/i.test(entry)) {
        mdPath = full
      }
      if (!mdPath) continue

      let raw = ''
      try {
        raw = readFileSync(mdPath, 'utf-8')
      } catch {
        continue
      }
      const fmMatch = /^---\n([\s\S]*?)\n---/.exec(raw)
      let title = slug
      let publishedAt = ''
      if (fmMatch) {
        const fm = fmMatch[1]
        const titleMatch = /^title:\s*(.*)$/m.exec(fm)
        const dateMatch = /^(?:date|published_at|publishedAt):\s*(.*)$/m.exec(fm)
        if (titleMatch) title = titleMatch[1].trim().replace(/^['"]|['"]$/g, '')
        if (dateMatch) publishedAt = dateMatch[1].trim().replace(/^['"]|['"]$/g, '')
      }
      if (!publishedAt) {
        publishedAt = entrySt.mtime.toISOString()
      }
      out.push({
        slug,
        title,
        category,
        published_at: publishedAt,
        url: `/a/${slug}`,
      })
    }
  }
  return out.sort((a, b) => (a.published_at < b.published_at ? 1 : -1)).slice(0, 10)
}

dashboardRouter.get('/', (_req, res) => {
  const db = getDb()
  const drafts = db
    .prepare(
      `SELECT id, topic, category, status, format, updated_at
       FROM drafts
       WHERE status != 'published'
       ORDER BY updated_at DESC
       LIMIT 50`
    )
    .all() as DraftRow[]

  const published = scanPublished()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const publishedThisMonth = published.filter((p) => p.published_at >= monthStart).length

  res.json({
    stats: {
      published_this_month: publishedThisMonth,
      drafts_in_progress: drafts.length,
    },
    drafts,
    published,
  })
})
