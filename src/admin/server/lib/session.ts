/**
 * 세션 토큰 생성/검증 + 로그인 실패 차단.
 *
 * 쿠키: saintremy_admin_session (httpOnly, sameSite=lax, path=/, 30일)
 * 세션 만료: 30일
 * 로그인 실패: IP당 5회 → 1시간 차단
 */
import { randomBytes } from 'node:crypto'
import { getDb } from './db.ts'

export const SESSION_COOKIE_NAME = 'saintremy_admin_session'
export const SESSION_TTL_DAYS = 30
export const MAX_LOGIN_ATTEMPTS = 5
export const LOGIN_BLOCK_MINUTES = 60

export function newSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function createSession(token: string, ip: string, userAgent: string): void {
  const db = getDb()
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  db.prepare(
    'INSERT INTO sessions (token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?)'
  ).run(token, expires, ip, userAgent)
}

export function validateSession(token: string | undefined): boolean {
  if (!token) return false
  const db = getDb()
  const row = db
    .prepare('SELECT expires_at FROM sessions WHERE token = ?')
    .get(token) as { expires_at: string } | undefined
  if (!row) return false
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
    return false
  }
  return true
}

export function destroySession(token: string | undefined): void {
  if (!token) return
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

export function purgeExpiredSessions(): number {
  const db = getDb()
  const result = db
    .prepare("DELETE FROM sessions WHERE expires_at < datetime('now')")
    .run()
  return result.changes
}

// ─── login_attempts ─────────────────────────────────────

export function isBlocked(ip: string): boolean {
  const db = getDb()
  const row = db
    .prepare('SELECT blocked_until FROM login_attempts WHERE ip_address = ?')
    .get(ip) as { blocked_until: string | null } | undefined
  if (!row || !row.blocked_until) return false
  return new Date(row.blocked_until).getTime() > Date.now()
}

export function recordLoginFailure(ip: string): { attempts: number; blockedUntil: string | null } {
  const db = getDb()
  const now = new Date()
  const existing = db
    .prepare('SELECT attempts FROM login_attempts WHERE ip_address = ?')
    .get(ip) as { attempts: number } | undefined

  const attempts = (existing?.attempts ?? 0) + 1
  const blockedUntil =
    attempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(now.getTime() + LOGIN_BLOCK_MINUTES * 60 * 1000).toISOString()
      : null

  db.prepare(
    `INSERT INTO login_attempts (ip_address, attempts, last_attempt, blocked_until)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(ip_address) DO UPDATE SET
       attempts = excluded.attempts,
       last_attempt = excluded.last_attempt,
       blocked_until = excluded.blocked_until`
  ).run(ip, attempts, now.toISOString(), blockedUntil)

  return { attempts, blockedUntil }
}

export function clearLoginAttempts(ip: string): void {
  getDb().prepare('DELETE FROM login_attempts WHERE ip_address = ?').run(ip)
}
