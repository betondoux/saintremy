import type { Env } from './_utils'
import { daysAgoMs, json, parseDays } from './_utils'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const days = parseDays(url, 30)
  const since = daysAgoMs(days)

  const rows = await env.DB.prepare(
    `SELECT
       a.slug,
       COALESCE(a.title, a.slug) AS title,
       COALESCE(a.category, 'unknown') AS category,
       a.published,
       (SELECT COUNT(*) FROM pageviews pv WHERE pv.article_slug = a.slug AND pv.ts >= ?1) AS pageviews,
       (SELECT COALESCE(AVG(pv.dwell_ms),0)/1000.0 FROM pageviews pv WHERE pv.article_slug = a.slug AND pv.ts >= ?1 AND pv.dwell_ms > 0) AS avg_dwell_sec,
       (SELECT COALESCE(AVG(pv.scroll_depth),0) FROM pageviews pv WHERE pv.article_slug = a.slug AND pv.ts >= ?1 AND pv.scroll_depth > 0) AS avg_scroll,
       (SELECT COUNT(*) FROM clicks c WHERE c.article_slug = a.slug AND c.ts >= ?1) AS clicks,
       (SELECT COALESCE(SUM(commission),0) FROM conversions cv WHERE cv.article_slug = a.slug AND cv.ts >= ?1 AND cv.status != 'cancelled') AS revenue
     FROM articles a`,
  )
    .bind(since)
    .all<{
      slug: string; title: string; category: string; published: string | null;
      pageviews: number; avg_dwell_sec: number; avg_scroll: number;
      clicks: number; revenue: number;
    }>()

  const enriched = (rows.results ?? []).map((r) => ({
    ...r,
    ctr: r.pageviews > 0 ? (r.clicks / r.pageviews) * 100 : 0,
  }))

  return json({ rows: enriched })
}
