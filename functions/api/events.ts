// functions/api/events.ts
//
// 클라이언트 tracker(src/lib/analytics.ts)가 호출하는 이벤트 수집 엔드포인트.
// - POST /api/events
//   Body: { type: 'pageview' | 'dwell', path, article_slug?, category?, referrer?, dwell_ms?, scroll_depth? }
// - sendBeacon 지원을 위해 text/plain도 허용

import type { Env } from '../_utils'
import {
  detectDevice,
  getClientIp,
  getCountry,
  getOrCreateSessionId,
  hashIp,
  json,
  nowMs,
  parseUtm,
} from '../_utils'

interface PageviewPayload {
  type: 'pageview'
  path: string
  article_slug?: string
  category?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

interface DwellPayload {
  type: 'dwell'
  path: string
  dwell_ms: number
  scroll_depth: number
}

type Payload = PageviewPayload | DwellPayload

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  let body: Payload
  try {
    const text = await request.text()
    body = JSON.parse(text) as Payload
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400)
  }

  if (!body || typeof body !== 'object' || !('type' in body)) {
    return json({ ok: false, error: 'invalid_payload' }, 400)
  }

  const ua = request.headers.get('User-Agent')
  const device = detectDevice(ua)
  if (device === 'bot') return json({ ok: true, skipped: 'bot' })

  const res = json({ ok: true })
  const sessionId = getOrCreateSessionId(request, res)
  const ip = getClientIp(request)
  const ipHash = await hashIp(ip, env.IP_SALT || 'saintremy-default-salt')
  const country = getCountry(request)
  const ts = nowMs()

  if (body.type === 'pageview') {
    const pv = body
    const path = String(pv.path || '/').slice(0, 512)
    const referrer = pv.referrer?.slice(0, 512) || null
    const url = new URL(request.url)
    const utmFromUrl = parseUtm(url)

    context.waitUntil(
      Promise.all([
        env.DB.prepare(
          `INSERT INTO pageviews (
             ts, session_id, path, article_slug, category,
             referrer, user_agent, country, device,
             utm_source, utm_medium, utm_campaign, ip_hash
           ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)`,
        )
          .bind(
            ts,
            sessionId,
            path,
            pv.article_slug || null,
            pv.category || null,
            referrer,
            ua,
            country,
            device,
            pv.utm_source || utmFromUrl.utm_source,
            pv.utm_medium || utmFromUrl.utm_medium,
            pv.utm_campaign || utmFromUrl.utm_campaign,
            ipHash,
          )
          .run(),
        env.DB.prepare(
          `INSERT INTO sessions (
             id, started_at, last_seen_at, country, device, referrer,
             utm_source, utm_medium, utm_campaign, landing_path, page_count
           ) VALUES (?1,?2,?2,?3,?4,?5,?6,?7,?8,?9,1)
           ON CONFLICT(id) DO UPDATE SET
             last_seen_at = excluded.last_seen_at,
             page_count   = sessions.page_count + 1`,
        )
          .bind(
            sessionId,
            ts,
            country,
            device,
            referrer,
            pv.utm_source || utmFromUrl.utm_source || null,
            pv.utm_medium || utmFromUrl.utm_medium || null,
            pv.utm_campaign || utmFromUrl.utm_campaign || null,
            path,
          )
          .run(),
      ]).catch((e) => console.error('pageview insert failed:', e)),
    )
  } else if (body.type === 'dwell') {
    const dw = body
    const dwell = Math.min(Math.max(0, Math.floor(dw.dwell_ms || 0)), 86_400_000)
    const depth = Math.min(Math.max(0, Math.floor(dw.scroll_depth || 0)), 100)
    const path = String(dw.path || '/').slice(0, 512)
    context.waitUntil(
      env.DB.prepare(
        `UPDATE pageviews
           SET dwell_ms = ?1, scroll_depth = ?2
         WHERE id = (
           SELECT id FROM pageviews
            WHERE session_id = ?3 AND path = ?4
            ORDER BY ts DESC LIMIT 1
         )`,
      )
        .bind(dwell, depth, sessionId, path)
        .run()
        .catch((e) => console.error('dwell update failed:', e)),
    )
  }

  return res
}
