import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminFetch, AdminApiError } from '../lib/api'

const CATEGORIES = ['style', 'home', 'space', 'deals', 'travel', 'music'] as const

const FORMATS = [
  { value: 'best-in-class', label: 'BEST 5/7' },
  { value: 'showcase', label: '쇼케이스 (1제품 깊이)' },
  { value: 'this-thing', label: '“이 물건”' },
  { value: 'gift-guide', label: '선물 가이드' },
] as const

const CHANNELS = [
  { value: 'coupang', label: '쿠팡' },
  { value: 'oliveyoung', label: '올리브영' },
  { value: 'ohou', label: '오늘의집' },
  { value: 'naver', label: '네이버' },
] as const

type Format = (typeof FORMATS)[number]['value']
type Channel = (typeof CHANNELS)[number]['value']

export function NewArticle() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState<string>('gift')
  const [format, setFormat] = useState<Format>('best-in-class')
  const [channels, setChannels] = useState<Set<Channel>>(new Set(['coupang']))
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function toggleChannel(c: Channel) {
    setChannels((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (topic.trim().length === 0) {
      setError('주제를 입력하세요.')
      return
    }
    if (channels.size === 0) {
      setError('채널을 1개 이상 선택하세요.')
      return
    }
    setBusy(true)
    try {
      const res = await adminFetch<{ id: string; redirect: string }>(
        '/api/admin/articles',
        {
          method: 'POST',
          json: {
            topic: topic.trim(),
            category,
            format,
            channels: Array.from(channels),
            price_min: priceMin ? Number(priceMin) : null,
            price_max: priceMax ? Number(priceMax) : null,
            custom_instructions: customInstructions.trim() || null,
          },
        }
      )
      navigate(res.redirect, { replace: true })
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(`제출 실패: ${err.message}`)
      } else {
        setError('네트워크 오류')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <h1>새 기사</h1>
        <div className="topbar-actions">
          <Link className="btn btn-ghost" to="/dashboard">
            대시보드
          </Link>
        </div>
      </div>

      <div className="shell">
        {error && <div className="alert alert-error">{error}</div>}

        <form className="form-card" onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="topic">주제 *</label>
              <p className="field-hint">예: “홈오피스 데스크 셋업 BEST 5”, “여름 자외선 차단제 진짜 좋은 것”</p>
              <input
                id="topic"
                type="text"
                maxLength={100}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="기사의 핵심 주제 (~100자)"
                required
              />
            </div>

            <div className="field">
              <label>카테고리 *</label>
              <div className="options">
                {CATEGORIES.map((c) => (
                  <label
                    key={c}
                    className={`option ${category === c ? 'option-checked' : ''}`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c}
                      checked={category === c}
                      onChange={() => setCategory(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label>포맷 *</label>
              <div className="options">
                {FORMATS.map((f) => (
                  <label
                    key={f.value}
                    className={`option ${format === f.value ? 'option-checked' : ''}`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={f.value}
                      checked={format === f.value}
                      onChange={() => setFormat(f.value)}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label>채널 *</label>
              <p className="field-hint">최소 1개 이상</p>
              <div className="options">
                {CHANNELS.map((c) => (
                  <label
                    key={c.value}
                    className={`option ${channels.has(c.value) ? 'option-checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={channels.has(c.value)}
                      onChange={() => toggleChannel(c.value)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="price-min">가격대 (선택)</label>
                <input
                  id="price-min"
                  type="number"
                  inputMode="numeric"
                  placeholder="최소 (원)"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="price-max">&nbsp;</label>
                <input
                  id="price-max"
                  type="number"
                  inputMode="numeric"
                  placeholder="최대 (원)"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="custom-instructions">추가 지시 (선택)</label>
              <p className="field-hint">에이전트에게 전달할 톤·각도·금기어 등 (~500자)</p>
              <textarea
                id="custom-instructions"
                maxLength={500}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="예: 키보드는 무접점/적축 위주로, 가성비보다 ‘이거 사면 후회 없다’ 톤"
              />
            </div>
          </div>

          <div className="form-foot">
            <Link className="btn btn-ghost" to="/dashboard">
              취소
            </Link>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? '저장 중…' : '✨ 에이전트 시작'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
