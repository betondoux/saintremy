// src/admin/lib/dashboard-api.ts
//
// 대시보드 API 클라이언트.
// - PRODUCTION (Cloudflare Pages): /api/dashboard/* → functions/api/dashboard/*.ts (D1 기반)
//   _middleware.ts가 admin 세션 또는 X-Admin-Token 헤더로 인증을 강제함.
// - LOCAL DEV (Express @5174 + Vite middleware): D1 바인딩 없음 → 404 → mockData 폴백.
//
// adminFetch와 별개의 클라이언트 (다른 base path, 다른 폴백 정책).

export interface OverviewData {
  today: {
    pageviews: number
    clicks: number
    ctr: number
    revenue: number
    sessions: number
  }
  yesterday: {
    pageviews: number
    clicks: number
    revenue: number
  }
  series: Array<{
    date: string
    pageviews: number
    clicks: number
    revenue: number
  }>
  topArticles: Array<{
    slug: string
    title: string
    pageviews: number
    clicks: number
    ctr: number
    revenue: number
  }>
  topPartners: Array<{
    partner_id: string
    name: string
    color: string
    clicks: number
    revenue: number
  }>
}

export interface ArticleRow {
  slug: string
  title: string
  category: string
  published: string | null
  pageviews: number
  avg_dwell_sec: number
  avg_scroll: number
  clicks: number
  ctr: number
  revenue: number
}

export interface ProductRow {
  id: string
  slug: string
  name: string
  brand: string | null
  category: string
  clicks: number
  revenue: number
  byPartner: Array<{ partner_id: string; clicks: number; revenue: number }>
}

export interface PartnerRow {
  partner_id: string
  name: string
  color: string
  commission_rate: number
  clicks_7d: number
  clicks_30d: number
  revenue_7d: number
  revenue_30d: number
  pending_revenue: number
  confirmed_revenue: number
}

export interface TrafficData {
  sources: Array<{ source: string; sessions: number; clicks: number; revenue: number }>
  countries: Array<{ country: string; sessions: number; pageviews: number }>
  devices: Array<{ device: string; sessions: number; pageviews: number }>
  landingPages: Array<{ path: string; sessions: number; avg_dwell_sec: number }>
}

export interface RealtimeData {
  activeUsers: number
  recentEvents: Array<{
    ts: number
    type: 'pageview' | 'click'
    path?: string
    partner_id?: string
    article_slug?: string
    country: string | null
    device: string | null
  }>
  lastHour: { pageviews: number; clicks: number }
}

const BASE = '/api/dashboard'
const USE_MOCK = import.meta.env.DEV // 로컬 dev: 항상 mock 폴백 허용

async function get<T>(
  path: string,
  params?: Record<string, string | number>,
  mock?: () => unknown,
): Promise<T> {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))
    : ''
  try {
    const res = await fetch(`${BASE}${path}${qs}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
    if (res.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/admin/login'
      throw new Error('unauthorized')
    }
    if (!res.ok) throw new Error(`API ${path}: ${res.status}`)
    return (await res.json()) as T
  } catch (err) {
    if (USE_MOCK && mock) {
      console.info(`[mock] ${path} — API 미배포(D1 없음), 가짜 데이터 사용`)
      return mock() as T
    }
    throw err
  }
}

import {
  mockOverview, mockArticles, mockProducts, mockPartners,
  mockTraffic, mockRealtime, mockFunnel, mockContentHealth,
} from './mockData'

export const dashboardApi = {
  overview: (days = 7) => get<OverviewData>('/overview', { days }, () => mockOverview),
  articles: (days = 30) => get<{ rows: ArticleRow[] }>('/articles', { days }, () => mockArticles),
  products: (days = 30) => get<{ rows: ProductRow[] }>('/products', { days }, () => mockProducts),
  partners: () => get<{ rows: PartnerRow[] }>('/partners', undefined, () => mockPartners),
  traffic: (days = 7) => get<TrafficData>('/traffic', { days }, () => mockTraffic),
  realtime: () => get<RealtimeData>('/realtime', undefined, () => mockRealtime()),
  funnel: (days = 30) =>
    get<{
      pageviews: number
      productImpressions: number
      clicks: number
      confirmed: number
      stages: Array<{ name: string; value: number; rate: number }>
    }>('/funnel', { days }, () => mockFunnel),
  contentHealth: () =>
    get<{
      brokenLinks: Array<{ slug: string; partner: string; status: number }>
      missingProducts: Array<{ slug: string }>
      staleArticles: Array<{ slug: string; days_since_view: number }>
    }>('/content-health', undefined, () => mockContentHealth),
}
