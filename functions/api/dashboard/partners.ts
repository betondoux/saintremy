import type { Env } from './_utils'
import { daysAgoMs, json } from './_utils'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const s7 = daysAgoMs(7)
  const s30 = daysAgoMs(30)

  const rows = await env.DB.prepare(
    `SELECT
       p.id AS partner_id, p.name, p.color, p.commission_rate,
       (SELECT COUNT(*) FROM clicks c WHERE c.partner_id = p.id AND c.ts >= ?1) AS clicks_7d,
       (SELECT COUNT(*) FROM clicks c WHERE c.partner_id = p.id AND c.ts >= ?2) AS clicks_30d,
       (SELECT COALESCE(SUM(commission),0) FROM conversions cv
          WHERE cv.partner_id = p.id AND cv.ts >= ?1 AND cv.status != 'cancelled') AS revenue_7d,
       (SELECT COALESCE(SUM(commission),0) FROM conversions cv
          WHERE cv.partner_id = p.id AND cv.ts >= ?2 AND cv.status != 'cancelled') AS revenue_30d,
       (SELECT COALESCE(SUM(commission),0) FROM conversions cv
          WHERE cv.partner_id = p.id AND cv.status = 'pending') AS pending_revenue,
       (SELECT COALESCE(SUM(commission),0) FROM conversions cv
          WHERE cv.partner_id = p.id AND cv.status = 'confirmed') AS confirmed_revenue
     FROM partners p
     ORDER BY revenue_30d DESC, clicks_30d DESC`,
  )
    .bind(s7, s30)
    .all()

  return json({ rows: rows.results ?? [] })
}
