import type { Env } from './_utils'
import { daysAgoMs, json } from './_utils'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const missing = await env.DB.prepare(
    `SELECT a.slug FROM articles a
     WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.related_article_slug = a.slug)
     LIMIT 50`,
  ).all<{ slug: string }>()

  const since30 = daysAgoMs(30)
  const stale = await env.DB.prepare(
    `SELECT a.slug,
       CAST((strftime('%s','now')*1000 - COALESCE(
         (SELECT MAX(ts) FROM pageviews pv WHERE pv.article_slug = a.slug),
         a.last_synced
       )) / 86400000 AS INTEGER) AS days_since_view
     FROM articles a
     WHERE NOT EXISTS (
       SELECT 1 FROM pageviews pv
        WHERE pv.article_slug = a.slug AND pv.ts >= ?1
     )
     ORDER BY days_since_view DESC
     LIMIT 50`,
  )
    .bind(since30)
    .all<{ slug: string; days_since_view: number }>()

  return json({
    brokenLinks: [],
    missingProducts: missing.results ?? [],
    staleArticles: stale.results ?? [],
  })
}
