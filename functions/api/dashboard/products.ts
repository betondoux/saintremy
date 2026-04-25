import type { Env } from './_utils'
import { daysAgoMs, json, parseDays } from './_utils'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const days = parseDays(url, 30)
  const since = daysAgoMs(days)

  const products = await env.DB.prepare(
    `SELECT
       p.id, p.slug, p.name, p.brand, p.category,
       (SELECT COUNT(*) FROM clicks c WHERE c.product_id = p.id AND c.ts >= ?1) AS clicks,
       (SELECT COALESCE(SUM(commission),0) FROM conversions cv WHERE cv.product_id = p.id AND cv.ts >= ?1 AND cv.status != 'cancelled') AS revenue
     FROM products p
     WHERE EXISTS (SELECT 1 FROM clicks c WHERE c.product_id = p.id AND c.ts >= ?1)
        OR EXISTS (SELECT 1 FROM conversions cv WHERE cv.product_id = p.id AND cv.ts >= ?1)
     ORDER BY revenue DESC, clicks DESC
     LIMIT 200`,
  )
    .bind(since)
    .all<{
      id: string; slug: string; name: string; brand: string | null; category: string;
      clicks: number; revenue: number;
    }>()

  const byPartnerRaw = await env.DB.prepare(
    `SELECT product_id, partner_id, COUNT(*) AS clicks,
       (SELECT COALESCE(SUM(commission),0) FROM conversions cv
         WHERE cv.product_id = clicks.product_id AND cv.partner_id = clicks.partner_id
           AND cv.ts >= ?1 AND cv.status != 'cancelled') AS revenue
     FROM clicks
     WHERE ts >= ?1 AND product_id IS NOT NULL
     GROUP BY product_id, partner_id`,
  )
    .bind(since)
    .all<{ product_id: string; partner_id: string; clicks: number; revenue: number }>()

  const byPartnerMap = new Map<string, { partner_id: string; clicks: number; revenue: number }[]>()
  for (const row of byPartnerRaw.results ?? []) {
    const list = byPartnerMap.get(row.product_id) ?? []
    list.push({ partner_id: row.partner_id, clicks: row.clicks, revenue: row.revenue })
    byPartnerMap.set(row.product_id, list)
  }

  const rows = (products.results ?? []).map((p) => ({
    ...p,
    byPartner: byPartnerMap.get(p.id) ?? [],
  }))

  return json({ rows })
}
