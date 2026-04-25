// functions/api/dashboard/_utils.ts
//
// 대시보드 전용 공용 유틸. 루트 functions/_utils.ts(트래커용)와 별도.
// Cloudflare Pages Functions 환경에서 D1을 직접 쿼리한다.

export interface Env {
  DB: D1Database
  /** 선택: X-Admin-Token 헤더 인증용. wrangler pages secret put ADMIN_DASHBOARD_TOKEN. */
  ADMIN_DASHBOARD_TOKEN?: string
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export function unauthorized(reason: string): Response {
  return new Response(JSON.stringify({ error: 'unauthorized', reason }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export function daysAgoMs(days: number): number {
  return Date.now() - days * 86_400_000
}

export function parseDays(url: URL, def = 7): number {
  const v = Number(url.searchParams.get('days') || def)
  return Math.max(1, Math.min(365, Math.floor(v) || def))
}

export function msToDateKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function estimateRevenue(
  clicks: number,
  commissionRate: number,
  avgOrderKrw = 30_000,
  assumedCvr = 0.03,
): number {
  return Math.round(clicks * assumedCvr * avgOrderKrw * (commissionRate / 100))
}
