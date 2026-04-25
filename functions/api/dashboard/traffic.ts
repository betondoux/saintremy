import type { Env } from './_utils'
import { daysAgoMs, json, parseDays } from './_utils'

function classifyReferrer(ref: string | null): string {
  if (!ref) return '직접/북마크'
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '')
    if (/google\./.test(host)) return 'Google 검색'
    if (/naver\.com$/.test(host)) return 'Naver 검색'
    if (/bing\.com$/.test(host)) return 'Bing 검색'
    if (/daum\.net$/.test(host)) return 'Daum 검색'
    if (/instagram\./.test(host)) return 'Instagram'
    if (/threads\./.test(host)) return 'Threads'
    if (/t\.co$|twitter\.|x\.com$/.test(host)) return 'X/Twitter'
    if (/facebook\./.test(host)) return 'Facebook'
    if (/youtube\./.test(host)) return 'YouTube'
    if (/reddit\./.test(host)) return 'Reddit'
    if (/ohou\.se/.test(host)) return '오늘의집'
    if (/t\.me/.test(host)) return 'Telegram'
    return host
  } catch {
    return '기타'
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const days = parseDays(url, 7)
  const since = daysAgoMs(days)

  const sessionRows = await env.DB.prepare(
    `SELECT id, utm_source, referrer FROM sessions WHERE started_at >= ?1`,
  )
    .bind(since)
    .all<{ id: string; utm_source: string | null; referrer: string | null }>()

  const clickRows = await env.DB.prepare(
    `SELECT session_id FROM clicks WHERE ts >= ?1`,
  )
    .bind(since)
    .all<{ session_id: string }>()
  const clickBySession = new Map<string, number>()
  for (const r of clickRows.results ?? []) {
    clickBySession.set(r.session_id, (clickBySession.get(r.session_id) ?? 0) + 1)
  }

  const revRows = await env.DB.prepare(
    `SELECT cl.session_id, SUM(cv.commission) AS rev
       FROM conversions cv JOIN clicks cl ON cl.id = cv.click_id
      WHERE cv.ts >= ?1 AND cv.status != 'cancelled'
      GROUP BY cl.session_id`,
  )
    .bind(since)
    .all<{ session_id: string; rev: number }>()
  const revBySession = new Map<string, number>()
  for (const r of revRows.results ?? [])
    revBySession.set(r.session_id, r.rev)

  const sourceAgg = new Map<
    string,
    { sessions: number; clicks: number; revenue: number }
  >()
  for (const s of sessionRows.results ?? []) {
    const key = s.utm_source ?? classifyReferrer(s.referrer)
    const cur = sourceAgg.get(key) ?? { sessions: 0, clicks: 0, revenue: 0 }
    cur.sessions += 1
    cur.clicks += clickBySession.get(s.id) ?? 0
    cur.revenue += revBySession.get(s.id) ?? 0
    sourceAgg.set(key, cur)
  }

  const sources = [...sourceAgg.entries()]
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 25)

  const countriesRaw = await env.DB.prepare(
    `SELECT country, COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS pageviews
       FROM pageviews WHERE ts >= ?1
       GROUP BY country ORDER BY sessions DESC LIMIT 25`,
  )
    .bind(since)
    .all<{ country: string | null; sessions: number; pageviews: number }>()

  const devicesRaw = await env.DB.prepare(
    `SELECT device, COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS pageviews
       FROM pageviews WHERE ts >= ?1
       GROUP BY device ORDER BY sessions DESC`,
  )
    .bind(since)
    .all<{ device: string | null; sessions: number; pageviews: number }>()

  const landingsRaw = await env.DB.prepare(
    `SELECT landing_path AS path,
            COUNT(*) AS sessions,
            COALESCE(
              (SELECT AVG(pv.dwell_ms)/1000.0 FROM pageviews pv
                WHERE pv.path = sessions.landing_path AND pv.dwell_ms > 0 AND pv.ts >= ?1),
              0) AS avg_dwell_sec
       FROM sessions
      WHERE started_at >= ?1 AND landing_path IS NOT NULL
      GROUP BY landing_path
      ORDER BY sessions DESC
      LIMIT 25`,
  )
    .bind(since)
    .all<{ path: string; sessions: number; avg_dwell_sec: number }>()

  return json({
    sources,
    countries: (countriesRaw.results ?? []).map((r) => ({
      country: r.country ?? '—',
      sessions: r.sessions,
      pageviews: r.pageviews,
    })),
    devices: (devicesRaw.results ?? []).map((r) => ({
      device: r.device ?? '—',
      sessions: r.sessions,
      pageviews: r.pageviews,
    })),
    landingPages: landingsRaw.results ?? [],
  })
}
