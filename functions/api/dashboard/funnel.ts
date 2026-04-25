import type { Env } from './_utils'
import { daysAgoMs, json, parseDays } from './_utils'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const days = parseDays(url, 30)
  const since = daysAgoMs(days)

  const stats = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM pageviews WHERE ts >= ?1) AS pv,
       (SELECT COUNT(*) FROM clicks    WHERE ts >= ?1) AS clicks,
       (SELECT COUNT(*) FROM conversions WHERE ts >= ?1 AND status = 'confirmed') AS confirmed`,
  )
    .bind(since)
    .first<{ pv: number; clicks: number; confirmed: number }>()

  const pv = stats?.pv ?? 0
  const clicks = stats?.clicks ?? 0
  const confirmed = stats?.confirmed ?? 0
  const productImpressions = Math.max(clicks * 10, pv)

  const stages = [
    { name: '페이지뷰', value: pv, rate: 100 },
    {
      name: '제품 임프레션 (추정)',
      value: productImpressions,
      rate: pv > 0 ? (productImpressions / pv) * 100 : 0,
    },
    {
      name: '제휴 클릭',
      value: clicks,
      rate: productImpressions > 0 ? (clicks / productImpressions) * 100 : 0,
    },
    {
      name: '구매 확정',
      value: confirmed,
      rate: clicks > 0 ? (confirmed / clicks) * 100 : 0,
    },
  ]

  return json({ pageviews: pv, productImpressions, clicks, confirmed, stages })
}
