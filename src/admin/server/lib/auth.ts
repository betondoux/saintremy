/**
 * 비밀번호 검증 + IP 화이트리스트 체크.
 *
 * env:
 *   ADMIN_PASSWORD_HASH — bcrypt hash (admin:setup으로 생성)
 *   ADMIN_IP_WHITELIST  — 콤마 구분 IP 목록. 빈 값이면 무제한.
 */
import bcrypt from 'bcrypt'

export async function verifyPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) return false
  if (typeof plain !== 'string' || plain.length === 0) return false
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

export function isIpAllowed(ip: string): boolean {
  const raw = (process.env.ADMIN_IP_WHITELIST ?? '').trim()
  if (!raw) return true // 빈 값 → 무제한 (옵션 A 기본)
  const allow = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return allow.includes(ip)
}

export function hasRequiredEnv(): { ok: boolean; missing: string[] } {
  const required = ['ADMIN_PASSWORD_HASH', 'SESSION_SECRET']
  const missing = required.filter((k) => !process.env[k])
  return { ok: missing.length === 0, missing }
}
