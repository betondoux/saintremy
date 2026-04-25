// src/admin/lib/mockData.ts
// 로컬 dev (vite middleware mode)에서 D1이 없으므로 Cloudflare Pages Functions가 404.
// 그때 dashboard-api.ts가 자동으로 이 가짜 데이터로 폴백한다.
//
// import.meta.env.DEV === true 일 때만 사용.

import type {
  OverviewData, ArticleRow, ProductRow, PartnerRow,
  TrafficData, RealtimeData,
} from './dashboard-api'

const now = Date.now()
const dayMs = 86_400_000

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

const sampleArticles = [
  { slug: 'sunscreen-best-5', title: '선크림 BEST 5 — 라운드랩, 닥터지부터 무기자차 1위까지', category: 'beauty' },
  { slug: 'ergonomic-chair-guide', title: '허리 안 아픈 사무용 의자, 15만원부터 180만원까지', category: 'furniture' },
  { slug: 'autumn-gift-2025', title: '센스있는 2만원대 추석 선물 10가지', category: 'gift' },
  { slug: 'minimal-kitchen-tools', title: '진짜 매일 쓰는 주방도구 12개만 남겼다', category: 'kitchen' },
  { slug: 'airpods-pro-3-review', title: 'AirPods Pro 3, 2년 쓰고도 살 가치 있나', category: 'deal' },
  { slug: 'home-gym-essentials', title: '방 한 칸 홈짐, 40만원으로 시작하는 법', category: 'move' },
  { slug: 'travel-carry-on-pack', title: '10일짜리 유럽 여행, 기내용 캐리어 하나로', category: 'travel' },
  { slug: 'linen-bedding-test', title: '여름 침구, 린넨 vs 피마코튼 7일 테스트', category: 'living' },
  { slug: 'capsule-wardrobe-autumn', title: '가을 캡슐 옷장 30벌로 60일 살기', category: 'style' },
  { slug: 'small-space-essentials', title: '15평에서 답답하지 않게 사는 법', category: 'space' },
]

const paths = [
  '/beauty', '/furniture', '/gift', '/kitchen', '/deal',
  '/move', '/travel', '/living', '/style', '/space',
  '/a/sunscreen-best-5', '/a/ergonomic-chair-guide', '/a/autumn-gift-2025',
  '/a/minimal-kitchen-tools', '/a/airpods-pro-3-review',
]

export const mockOverview: OverviewData = {
  today: {
    pageviews: 2847,
    sessions: 1923,
    clicks: 184,
    ctr: 6.46,
    revenue: 47_200,
  },
  yesterday: {
    pageviews: 2654,
    clicks: 171,
    revenue: 42_800,
  },
  series: Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * dayMs)
    const base = 2200 + Math.floor(Math.sin(i * 0.9) * 600 + Math.random() * 400)
    return {
      date: d.toISOString().slice(0, 10),
      pageviews: base,
      clicks: Math.floor(base * (0.05 + Math.random() * 0.03)),
      revenue: Math.floor(base * 18 + Math.random() * 5000),
    }
  }),
  topArticles: sampleArticles.slice(0, 8).map((a, i) => {
    const pv = 1500 - i * 120 + Math.floor(Math.random() * 200)
    const clicks = Math.floor(pv * (0.04 + Math.random() * 0.04))
    return {
      slug: a.slug,
      title: a.title,
      pageviews: pv,
      clicks,
      ctr: pv > 0 ? (clicks / pv) * 100 : 0,
      revenue: clicks * 270 + Math.floor(Math.random() * 4000),
    }
  }),
  topPartners: partners.slice(0, 5).map((p, i) => ({
    partner_id: p.id,
    name: p.name,
    color: p.color,
    clicks: 420 - i * 60 + Math.floor(Math.random() * 40),
    revenue: (420 - i * 60) * (400 + i * 100),
  })),
}

export const mockArticles: { rows: ArticleRow[] } = {
  rows: sampleArticles.map((a, i) => {
    const pv = 4200 - i * 300 + Math.floor(Math.random() * 400)
    const clicks = Math.floor(pv * (0.04 + Math.random() * 0.04))
    return {
      slug: a.slug,
      title: a.title,
      category: a.category,
      published: new Date(now - (i * 5 + 3) * dayMs).toISOString().slice(0, 10),
      pageviews: pv,
      avg_dwell_sec: 120 + Math.random() * 180,
      avg_scroll: 55 + Math.random() * 35,
      clicks,
      ctr: pv > 0 ? (clicks / pv) * 100 : 0,
      revenue: clicks * (250 + Math.random() * 200),
    }
  }),
}

export const mockProducts: { rows: ProductRow[] } = {
  rows: [
    { name: '닥터지 그린 마일드 업 선 플러스', brand: '닥터지', category: 'beauty', partners: ['coupang', 'oliveyoung', 'naver'] },
    { name: '시디즈 T50', brand: '시디즈', category: 'furniture', partners: ['coupang', 'naver', 'ohouse'] },
    { name: '허먼밀러 에어론 B', brand: '허먼밀러', category: 'furniture', partners: ['naver'] },
    { name: '라운드랩 1025 독도 토너', brand: '라운드랩', category: 'beauty', partners: ['oliveyoung', 'coupang'] },
    { name: '드롱기 디디카 EC685', brand: '드롱기', category: 'kitchen', partners: ['coupang', 'naver'] },
    { name: '리모와 에센셜 기내용', brand: '리모와', category: 'travel', partners: ['naver', 'amazon'] },
    { name: 'AirPods Pro 3세대', brand: 'Apple', category: 'deal', partners: ['coupang', 'naver', 'amazon'] },
    { name: '무인양품 유기농 코튼 이불', brand: '무인양품', category: 'living', partners: ['coupang', 'ohouse'] },
  ].map((p, i) => {
    const clicks = 320 - i * 30 + Math.floor(Math.random() * 50)
    return {
      id: `prod-${i + 1}`,
      slug: `product-${i + 1}`,
      name: p.name,
      brand: p.brand,
      category: p.category,
      clicks,
      revenue: clicks * (300 + Math.random() * 400),
      byPartner: p.partners.map((pid) => ({
        partner_id: pid,
        clicks: Math.floor(clicks / p.partners.length + Math.random() * 30),
        revenue: Math.floor((clicks / p.partners.length) * 300),
      })),
    }
  }),
}

export const mockPartners: { rows: PartnerRow[] } = {
  rows: partners.map((p, i) => ({
    partner_id: p.id,
    name: p.name,
    color: p.color,
    commission_rate: p.rate,
    clicks_7d: Math.floor((800 - i * 100) * (0.8 + Math.random() * 0.4)),
    clicks_30d: Math.floor((3200 - i * 400) * (0.8 + Math.random() * 0.4)),
    revenue_7d: Math.floor((45_000 - i * 5000) * (0.7 + Math.random() * 0.6)),
    revenue_30d: Math.floor((180_000 - i * 20_000) * (0.7 + Math.random() * 0.6)),
    pending_revenue: Math.floor((60_000 - i * 6000) * (0.7 + Math.random() * 0.6)),
    confirmed_revenue: Math.floor((120_000 - i * 14_000) * (0.7 + Math.random() * 0.6)),
  })),
}

export const mockTraffic: TrafficData = {
  sources: [
    { source: 'Google 검색', sessions: 5234, clicks: 312, revenue: 84_200 },
    { source: '직접/북마크', sessions: 2104, clicks: 145, revenue: 38_700 },
    { source: 'Naver 검색', sessions: 1876, clicks: 121, revenue: 32_400 },
    { source: 'Instagram', sessions: 1243, clicks: 89, revenue: 24_800 },
    { source: 'Threads', sessions: 892, clicks: 67, revenue: 18_200 },
    { source: '오늘의집', sessions: 432, clicks: 34, revenue: 9400 },
    { source: 'X/Twitter', sessions: 287, clicks: 18, revenue: 5200 },
  ],
  countries: [
    { country: 'KR', sessions: 11_287, pageviews: 17_842 },
    { country: 'US', sessions: 234, pageviews: 389 },
    { country: 'JP', sessions: 142, pageviews: 201 },
    { country: 'SG', sessions: 87, pageviews: 124 },
    { country: 'VN', sessions: 54, pageviews: 78 },
  ],
  devices: [
    { device: 'mobile', sessions: 8924, pageviews: 13_428 },
    { device: 'desktop', sessions: 2876, pageviews: 4821 },
    { device: 'tablet', sessions: 324, pageviews: 418 },
  ],
  landingPages: paths.slice(0, 10).map((path, i) => ({
    path,
    sessions: 1200 - i * 100 + Math.floor(Math.random() * 100),
    avg_dwell_sec: 80 + Math.random() * 200,
  })),
}

export const mockRealtime = (): RealtimeData => ({
  activeUsers: 23 + Math.floor(Math.random() * 15),
  lastHour: {
    pageviews: 487 + Math.floor(Math.random() * 60),
    clicks: 34 + Math.floor(Math.random() * 8),
  },
  recentEvents: Array.from({ length: 20 }, (_, i) => {
    const type = Math.random() > 0.75 ? 'click' : 'pageview'
    const ts = now - i * (15_000 + Math.random() * 45_000)
    if (type === 'click') {
      const partner = partners[Math.floor(Math.random() * 4)]
      const article = sampleArticles[Math.floor(Math.random() * sampleArticles.length)]
      return {
        ts,
        type: 'click' as const,
        partner_id: partner.id,
        article_slug: article.slug,
        country: 'KR',
        device: Math.random() > 0.3 ? 'mobile' : 'desktop',
      }
    }
    return {
      ts,
      type: 'pageview' as const,
      path: paths[Math.floor(Math.random() * paths.length)],
      country: Math.random() > 0.92 ? 'US' : 'KR',
      device: Math.random() > 0.3 ? 'mobile' : 'desktop',
    }
  }),
})

export const mockFunnel = {
  pageviews: 42_187,
  productImpressions: 28_934,
  clicks: 2104,
  confirmed: 89,
  stages: [
    { name: '페이지뷰', value: 42_187, rate: 100 },
    { name: '제품 임프레션 (추정)', value: 28_934, rate: 68.6 },
    { name: '제휴 클릭', value: 2104, rate: 7.27 },
    { name: '구매 확정', value: 89, rate: 4.23 },
  ],
}

export const mockContentHealth = {
  brokenLinks: [
    { slug: 'old-kitchen-tools', partner: 'coupang', status: 404 },
    { slug: 'deleted-product-review', partner: 'naver', status: 410 },
  ],
  missingProducts: [
    { slug: 'upcoming-gift-guide' },
    { slug: 'draft-style-piece' },
  ],
  staleArticles: [
    { slug: 'ancient-review-2024', days_since_view: 52 },
    { slug: 'outdated-trend', days_since_view: 38 },
  ],
}
