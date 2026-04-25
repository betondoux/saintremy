/**
 * admin SPA용 fetch 헬퍼.
 * - 항상 같은 origin (Express 5174 자체) → credentials 'same-origin' 충분
 * - JSON 자동 인/디코드
 * - 401 → /admin/login 자동 리다이렉트 (세션 만료 시)
 */

export class AdminApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string
  ) {
    super(message)
  }
}

export async function adminFetch<T = unknown>(
  path: string,
  opts: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, headers, ...rest } = opts
  const init: RequestInit = {
    credentials: 'same-origin',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  }
  const res = await fetch(path, init)
  const ct = res.headers.get('content-type') ?? ''
  const body: unknown = ct.includes('application/json') ? await res.json() : await res.text()

  if (res.status === 401 && typeof window !== 'undefined' && !path.includes('/auth/login')) {
    window.location.href = '/admin/login'
    throw new AdminApiError(401, body, 'unauthorized')
  }
  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `HTTP ${res.status}`
    throw new AdminApiError(res.status, body, message)
  }
  return body as T
}
