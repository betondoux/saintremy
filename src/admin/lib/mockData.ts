// src/admin/lib/mockData.ts
//
// 로컬 dev (vite middleware mode)에서 D1이 없으므로 Cloudflare Pages Functions가 404.
// 그때 dashboard-api.ts가 자동으로 이 가짜 데이터로 폴백한다.
//
// 정책 (2026-04-25): 모든 수치는 0, 모든 컬렉션은 발행 실재 6편 또는 빈 배열.
// 형님이 매일 보는 화면이라 비현실적 가짜 데이터(₩47k 수익, 1.9k 방문자)는
// 사기 진작에 부정적 → 운영 D1이 진짜 데이터를 채울 때까지 0 유지.
//
// import.meta.env.DEV === true 일 때만 사용.

import type {
  OverviewData, ArticleRow, ProductRow, PartnerRow,
  TrafficData, RealtimeData,
} from './dashboard-api'

// ─── 발행 실재 6편 (content/articles/**) ─────────────────────
// 새 기사 발행 시 sync:d1 후 D1에서 읽히므로 여기 손볼 필요 없음.
const realArticles = [
  { slug: 'best-gentle-cleansers-under-20000', title: '2만원 이하 진짜 순한 클렌저 7가지', category: 'beauty' },
  { slug: 'sunscreen-best-5', title: '선크림 BEST 5', category: 'beauty' },
  { slug: 'best-desk-lamps-top-5', title: '재택근무자용 책상 조명 5가지', category: 'desk' },
  { slug: 'parents-day-gift-best-4', title: '어버이날 선물 BEST 4', category: 'gift' },
  { slug: 'deal-radar-2026-04-w4', title: '이번 주 딜 레이더 — 2026 4월 4주차', category: 'deal' },
  { slug: 'duel-1-airpods-pro-3-vs-galaxy-buds-4-pro', title: 'AirPods Pro 3 vs Galaxy Buds 4 Pro', category: 'style' },
]

// 파트너 정의 (workers/schema.sql 시드와 동일). 수치는 모두 0.
const partners = [
  { id: 'coupang', name: '쿠팡 파트너스', color: '#E2231A', rate: 3.0 },
  { id: 'naver', name: '네이버 쇼핑 커넥트', color: '#03C75A', rate: 5.0 },
  { id: 'ohouse', name: '오늘의집 큐레이터', color: '#35C5F0', rate: 3.0 },
  { id: 'oliveyoung', name: '올리브영 큐레이터', color: '#8BC34A', rate: 7.0 },
  { id: 'musinsa', name: '무신사 큐레이터', color: '#000000', rate: 10.0 },
  { id: 'aliexpress', name: '알리익스프레스', color: '#FF4747', rate: 6.0 },
  { id: 'amazon', name: '아마존 어소시에이트', color: '#FF9900', rate: 4.0 },
  { id: 'linkprice', name: '링크프라이스 (네트워크)', color: '#6366F1', rate: 0.0 },
]

// 7일 시계열 (모두 0). 그래프는 평탄한 라인으로 그려짐.
const now = Date.now()
const dayMs = 86_400_000
const flatSeries = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(now - (6 - i) * dayMs)
  return {
    date: d.toISOString().slice(0, 10),
    pageviews: 0,
    clicks: 0,
    revenue: 0,
  }
})

export const mockOverview: OverviewData = {
  today: { pageviews: 0, sessions: 0, clicks: 0, ctr: 0, revenue: 0 },
  yesterday: { pageviews: 0, clicks: 0, revenue: 0 },
  series: flatSeries,
  topArticles: [], // 트래픽 0이라 자연스럽게 빈 배열
  topPartners: [],
}

export const mockArticles: { rows: ArticleRow[] } = {
  // 발행본 6편을 표시하되 모든 트래픽 지표는 0.
  // 운영 D1이 채워지면 실제 PV/클릭/수익이 들어옴.
  rows: realArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    published: null,
    pageviews: 0,
    avg_dwell_sec: 0,
    avg_scroll: 0,
    clicks: 0,
    ctr: 0,
    revenue: 0,
  })),
}

export const mockProducts: { rows: ProductRow[] } = {
  // 빈 배열. 페이지에서 emptyText("아직 데이터 없음")로 표시됨.
  rows: [],
}

export const mockPartners: { rows: PartnerRow[] } = {
  rows: partners.map((p) => ({
    partner_id: p.id,
    name: p.name,
    color: p.color,
    commission_rate: p.rate,
    clicks_7d: 0,
    clicks_30d: 0,
    revenue_7d: 0,
    revenue_30d: 0,
    pending_revenue: 0,
    confirmed_revenue: 0,
  })),
}

export const mockTraffic: TrafficData = {
  sources: [],
  countries: [],
  devices: [],
  landingPages: [],
}

export const mockRealtime = (): RealtimeData => ({
  activeUsers: 0,
  lastHour: { pageviews: 0, clicks: 0 },
  recentEvents: [],
})

export const mockFunnel = {
  pageviews: 0,
  productImpressions: 0,
  clicks: 0,
  confirmed: 0,
  stages: [
    { name: '페이지뷰', value: 0, rate: 0 },
    { name: '제품 임프레션 (추정)', value: 0, rate: 0 },
    { name: '제휴 클릭', value: 0, rate: 0 },
    { name: '구매 확정', value: 0, rate: 0 },
  ],
}

export const mockContentHealth = {
  brokenLinks: [],
  missingProducts: [],
  staleArticles: [],
}
