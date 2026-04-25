import type { Env } from './_utils'
import { json } from './_utils'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const now = Date.now()
  const active5m = now - 5 * 60 * 1000
  const lastHour = now - 60 * 60 * 1000

  const active = await env.DB.prepare(
    `SELECT COUNT(DISTINCT session_id) AS n FROM pageviews WHERE ts >= ?1`,
  )
    .bind(active5m)
    .first<{ n: number }>()

  const lastHourStats = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM pageviews WHERE ts >= ?1) AS pv,
       (SELECT COUNT(*) FROM clicks    WHERE ts >= ?1) AS clicks`,
  )
    .bind(lastHour)
    .first<{ pv: number; clicks: number }>()

  const eventsRaw = await env.DB.prepare(
    `SELECT 'pageview' AS type, ts, path, article_slug, NULL AS partner_id, country, device
       FROM pageviews WHERE ts >= ?1
     UNION ALL
     SELECT 'click' AS type, ts, NULL AS path, article_slug, partner_id, country, device
       FROM clicks WHERE ts >= ?1
     ORDER BY ts DESC LIMIT 50`,
  )
    .bind(lastHour)
    .all<{
      type: 'pageview' | 'click'
      ts: number
      path: string | null
      article_slug: string | null
      partner_id: string | null
      country: string | null
      device: string | null
    }>()

  return json({
    activeUsers: active?.n ?? 0,
    lastHour: {
      pageviews: lastHourStats?.pv ?? 0,
      clicks: lastHourStats?.clicks ?? 0,
    },
    recentEvents: (eventsRaw.results ?? []).map((e) => ({
      ts: e.ts,
      type: e.type,
      path: e.path ?? undefined,
      article_slug: e.article_slug ?? undefined,
      partner_id: e.partner_id ?? undefined,
      country: e.country,
      device: e.device,
    })),
  })
}
