// functions/go/[slug]/[partner].ts
//
// 모든 제휴 링크는 /go/<article-slug>/<partner-id>?pid=<product-id> 형태로 가공된다.
// 클릭을 D1에 기록하고 실제 파트너 URL로 302 리다이렉트.
//
// 예시:
//   /go/sunscreen-best-5/coupang?pid=dr-gbm-uvsun
//   → clicks 로그 → 302 https://link.coupang.com/...
//
// 파트너 실제 URL은 products 테이블의 row를 참조한다.
// products.target_url_by_partner(JSON) 또는 단순히 affiliateURL을 partner 별로 매핑.

import type { Env } from '../../_utils'
import {
  detectDevice,
  getClientIp,
  getCountry,
  getOrCreateSessionId,
  hashIp,
  nowMs,
  parseUtm,
} from '../../_utils'

interface Params {
  slug: string
  partner: string
}

interface ProductRow {
  id: string
  affiliate_url: string | null
}

export const onRequestGet: PagesFunction<Env, keyof Params> = async (
  context,
) => {
  const { request, env, params } = context
  const url = new URL(request.url)
  const articleSlug = String(params.slug || '').slice(0, 128)
  const partnerId = String(params.partner || '').toLowerCase().slice(0, 32)
  const productId = url.searchParams.get('pid')?.slice(0, 64) || null
  const explicitUrl = url.searchParams.get('u') // 임시 — 제품 등록 전 테스트용

  // ── 타겟 URL 결정 ────────────────────────────────────────
  let targetUrl: string | null = explicitUrl
  if (!targetUrl && productId) {
    const row = await env.DB.prepare(
      `SELECT id,
              json_extract(affiliate_url, '$.${partnerId}') AS affiliate_url
         FROM products
        WHERE id = ?1
        LIMIT 1`,
    )
      .bind(productId)
      .first<ProductRow>()
    if (row?.affiliate_url) targetUrl = row.affiliate_url
  }

  if (!targetUrl) {
    // fallback: 파트너 도메인으로 보냄
    const partnerRow = await env.DB.prepare(
      `SELECT base_domain FROM partners WHERE id = ?1`,
    )
      .bind(partnerId)
      .first<{ base_domain: string }>()
    targetUrl = partnerRow?.base_domain
      ? `https://www.${partnerRow.base_domain}/`
      : 'https://saintremy.kr/'
  }

  // ── 리다이렉트 응답 먼저 만들기 (쿠키 세팅 포함) ──────────
  const res = new Response(null, {
    status: 302,
    headers: {
      Location: targetUrl,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  })

  const sessionId = getOrCreateSessionId(request, res)

  // ── 클릭 로그 기록 ────────────────────────────────────────
  const ua = request.headers.get('User-Agent')
  const device = detectDevice(ua)
  if (device === 'bot') return res // 봇 무시

  const ip = getClientIp(request)
  const ipHash = await hashIp(ip, env.IP_SALT || 'saintremy-default-salt')
  const utm = parseUtm(url)

  context.waitUntil(
    env.DB.prepare(
      `INSERT INTO clicks (
         ts, session_id, article_slug, product_id, partner_id, target_url,
         referrer, user_agent, country, device,
         utm_source, utm_medium, utm_campaign, ip_hash
       ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)`,
    )
      .bind(
        nowMs(),
        sessionId,
        articleSlug || null,
        productId,
        partnerId,
        targetUrl,
        request.headers.get('Referer') || null,
        ua,
        getCountry(request),
        device,
        utm.utm_source,
        utm.utm_medium,
        utm.utm_campaign,
        ipHash,
      )
      .run()
      .then(() =>
        env.DB.prepare(
          `UPDATE sessions SET click_count = click_count + 1, last_seen_at = ?1 WHERE id = ?2`,
        )
          .bind(nowMs(), sessionId)
          .run(),
      )
      .catch((e) => console.error('click log failed:', e)),
  )

  return res
}
