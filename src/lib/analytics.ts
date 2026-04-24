// src/lib/analytics.ts
//
// Saint-Rémy 클라이언트 tracker.
// - React Router 페이지 전환마다 pageview 이벤트 전송
// - unload 시점에 체류시간·스크롤 depth를 beacon으로 전송
// - 어필리에이트 링크(<a data-affiliate>)를 자동으로 /go/<slug>/<partner> 로 변환
//
// 사용법 (src/App.tsx):
//   import { useAnalytics } from './lib/analytics'
//   function App() { useAnalytics(); ... }

import { useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'

const ENDPOINT = '/api/events'

function getCategoryFromPath(path: string): string | undefined {
  const known = [
    'gift', 'deal', 'style', 'beauty', 'space',
    'kitchen', 'move', 'travel', 'furniture', 'living',
  ]
  const first = path.split('/').filter(Boolean)[0]
  return known.includes(first) ? first : undefined
}

function getArticleSlug(path: string): string | undefined {
  const m = path.match(/^\/a\/([^/?#]+)/)
  return m?.[1]
}

function send(payload: Record<string, unknown>, useBeacon = false) {
  try {
    const body = JSON.stringify(payload)
    if (useBeacon && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(ENDPOINT, blob)
      return
    }
    fetch(ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => {})
  } catch {
    // swallow
  }
}

export function useAnalytics(): void {
  const location = useLocation()
  const params = useParams()
  const enteredAt = useRef<number>(Date.now())
  const maxScroll = useRef<number>(0)
  const lastPath = useRef<string>('')

  // 스크롤 depth 추적
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const total = h.scrollHeight - h.clientHeight
      if (total <= 0) return
      const pct = Math.min(100, Math.max(0, (h.scrollTop / total) * 100))
      if (pct > maxScroll.current) maxScroll.current = pct
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 페이지 전환 감지
  useEffect(() => {
    const path = location.pathname + location.search
    // 이전 페이지 dwell 플러시
    if (lastPath.current && lastPath.current !== path) {
      send({
        type: 'dwell',
        path: lastPath.current,
        dwell_ms: Date.now() - enteredAt.current,
        scroll_depth: Math.floor(maxScroll.current),
      })
    }
    lastPath.current = path
    enteredAt.current = Date.now()
    maxScroll.current = 0

    // pageview
    const slug = getArticleSlug(location.pathname) || params.slug
    const category = getCategoryFromPath(location.pathname)
    send({
      type: 'pageview',
      path: location.pathname,
      article_slug: slug,
      category,
      referrer: document.referrer || undefined,
    })
  }, [location.pathname, location.search, params.slug])

  // unload 시점 dwell
  useEffect(() => {
    const onHide = () => {
      send(
        {
          type: 'dwell',
          path: lastPath.current || location.pathname,
          dwell_ms: Date.now() - enteredAt.current,
          scroll_depth: Math.floor(maxScroll.current),
        },
        true,
      )
    }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide()
    })
    return () => {
      window.removeEventListener('pagehide', onHide)
    }
  }, [location.pathname])
}

// ─────────────────────────────────────────────────────────────
// 어필리에이트 링크 빌더
// ─────────────────────────────────────────────────────────────

export type Partner =
  | 'coupang'
  | 'naver'
  | 'ohouse'
  | 'oliveyoung'
  | 'musinsa'
  | 'aliexpress'
  | 'amazon'

export interface AffiliateLinkInput {
  articleSlug: string
  partner: Partner
  productId?: string
}

/**
 * 외부 제휴 링크를 /go/<slug>/<partner>?pid=<productId> 형태로 변환.
 * 이 URL은 Cloudflare Pages Function이 302 리다이렉트하며 클릭을 기록한다.
 */
export function buildAffiliateHref(input: AffiliateLinkInput): string {
  const { articleSlug, partner, productId } = input
  const qs = productId ? `?pid=${encodeURIComponent(productId)}` : ''
  return `/go/${encodeURIComponent(articleSlug)}/${encodeURIComponent(partner)}${qs}`
}
