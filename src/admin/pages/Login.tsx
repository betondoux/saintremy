import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminFetch, AdminApiError } from '../lib/api'

export function Login() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await adminFetch<{ ok: true }>('/api/admin/auth/login', {
        method: 'POST',
        json: { password },
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof AdminApiError) {
        if (err.status === 429) {
          setError('실패 횟수가 너무 많습니다. 1시간 후 다시 시도하세요.')
        } else if (err.status === 401) {
          setError('비밀번호가 올바르지 않습니다.')
        } else {
          setError(`로그인 실패 (${err.status})`)
        }
      } else {
        setError('네트워크 오류. 콘솔을 확인하세요.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1 className="login-brand">Saint-Rémy Editor</h1>
        <p className="login-tag">로컬 전용 · saintremy.kr 운영자만</p>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="login-field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              required
            />
          </div>
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={busy || password.length === 0}
          >
            {busy ? '확인 중…' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
