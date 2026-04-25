import type { Env } from './_utils'
import { daysAgoMs, json, parseDays } from './_utils'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const days = parseDays(url, 7)
  const since = daysAgoMs(days)
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const yesterdayStart = todayStart - 86_400_000
  const yesterdayEnd = todayStart - 1

  const today = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM pageviews WHERE ts >= ?1) AS pv,
       (SELECT COUNT(DISTINCT session_id) FROM pageviews WHERE ts >= ?1) AS sessions,
       (SELECT COUNT(*) FROM clicks    WHERE ts >= ?1) AS clicks,
       (SELECT COALESCE(SUM(commission),0) FROM conversions WHERE ts >= ?1 AND status != 'cancelled') AS revenue`,
  )
    .bind(todayStart)
    .first<{ pv: number; sessions: number; clicks: number; revenue: number }>()

  const yesterday = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM pageviews WHERE ts BETWEEN ?1 AND ?2) AS pv,
       (SELECT COUNT(*) FROM clicks    WHERE ts BETWEEN ?1 AND ?2) AS clicks,
       (SELECT COALESCE(SUM(commission),0) FROM conversions WHERE ts BETWEEN ?1 AND ?2 AND status != 'cancelled') AS revenue`,
  )
    .bind(yesterdayStart, yesterdayEnd)
    .first<{ pv: number; clicks: number; revenue: number }>()

  const seriesRows = await env.DB.prepare(
    `SELECT
       date(ts/1000, 'unixepoch', 'localtime') AS d,
       COUNT(*) AS pv
     FROM pageviews
     WHERE ts >= ?1
     GROUP BY d
     ORDER BY d`,
  )
    .bind(since)
    .all<{ d: string; pv: number }>()

  const clickSeries = await env.DB.prepare(
    `SELECT
       date(ts/1000, 'unixepoch', 'localtime') AS d,
       COUNT(*) AS c
     FROM clicks WHERE ts >= ?1
     GROUP BY d`,
  )
    .bind(since)
    .all<{ d: string; c: number }>()

  const revSeries = await env.DB.prepare(
    `SELECT
       date(ts/1000, 'unixepoch', 'localtime') AS d,
       COALESCE(SUM(commission),0) AS r
     FROM conversions WHERE ts >= ?1 AND status != 'cancelled'
     GROUP BY d`,
  )
    .bind(since)
    .all<{ d: string; r: number }>()

  const clickMap = new Map(clickSeries.results?.map((x) => [x.d, x.c]))
  const revMap = new Map(revSeries.results?.map((x) => [x.d, x.r]))
  const series = (seriesRows.results ?? []).map((x) => ({
    date: x.d,
    pageviews: x.pv,
    clicks: clickMap.get(x.d) ?? 0,
    revenue: revMap.get(x.d) ?? 0,
  }))

  const topArticlesRaw = await env.DB.prepare(
    `SELECT
       pv.article_slug AS slug,
       COALESCE(a.title, pv.article_slug) AS title,
       COUNT(pv.id) AS pv,
       (SELECT COUNT(*) FROM clicks c WHERE c.article_slug = pv.article_slug AND c.ts >= ?1) AS clicks,
       (SELECT COALESCE(SUM(commission),0) FROM conversions cv WHERE cv.article_slug = pv.article_slug AND cv.ts >= ?1 AND status != 'cancelled') AS revenue
     FROM pageviews pv
     LEFT JOIN articles a ON a.slug = pv.article_slug
     WHERE pv.ts >= ?1 AND pv.article_slug IS NOT NULL
     GROUP BY pv.article_slug
     ORDER BY clicks DESC, pv DESC
     LIMIT 10`,
  )
    .bind(since)
    .all<{ slug: string; title: string; pv: number; clicks: number; revenue: number }>()

  const topArticles = (topArticlesRaw.results ?? []).map((r) => ({
    slug: r.slug,
    title: r.title,
    pageviews: r.pv,
    clicks: r.clicks,
    ctr: r.pv > 0 ? (r.clicks / r.pv) * 100 : 0,
    revenue: r.revenue,
  }))

  const topPartnersRaw = await env.DB.prepare(
    `SELECT
       p.id AS partner_id,
       p.name,
       p.color,
       COUNT(c.id) AS clicks,
       COALESCE((SELECT SUM(commission) FROM conversions cv WHERE cv.partner_id = p.id AND cv.ts >= ?1 AND status != 'cancelled'), 0) AS revenue
     FROM partners p
     LEFT JOIN clicks c ON c.partner_id = p.id AND c.ts >= ?1
     GROUP BY p.id
     ORDER BY revenue DESC, clicks DESC`,
  )
    .bind(since)
    .all<{ partner_id: string; name: string; color: string; clicks: number; revenue: number }>()

  return json({
    today: {
      pageviews: today?.pv ?? 0,
      sessions: today?.sessions ?? 0,
      clicks: today?.clicks ?? 0,
      ctr: today && today.pv > 0 ? (today.clicks / today.pv) * 100 : 0,
      revenue: today?.revenue ?? 0,
    },
    yesterday: {
      pageviews: yesterday?.pv ?? 0,
      clicks: yesterday?.clicks ?? 0,
      revenue: yesterday?.revenue ?? 0,
    },
    series,
    topArticles,
    topPartners: topPartnersRaw.results ?? [],
  })
}
