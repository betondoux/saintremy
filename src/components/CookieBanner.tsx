import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const CONSENT_KEY = 'amator_cookie_consent'

/**
 * CookieBanner — 한국 PIPA + GDPR 준수 쿠키 동의 배너.
 *
 * 동작:
 * - 최초 방문 시 하단에 표시
 * - Accept / Reject 버튼 제공
 * - localStorage에 선택 저장 → 재방문 시 표시 안 함
 * - Reject 시 Google Analytics / AdSense 비활성화 플래그 설정
 *
 * 디자인:
 * - The Strategist 스타일 (하단 고정, 흰 배경, 검정 테두리)
 * - 깔끔하고 방해되지 않음
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = localStorage.getItem(CONSENT_KEY)
    if (!existing) {
      // 1초 뒤 표시 (초기 로드 방해 안 함)
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    // Global flag for analytics/ads
    ;(window as any).__amator_consent = 'accepted'
  }

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected')
    setVisible(false)
    ;(window as any).__amator_consent = 'rejected'
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] bg-cream-100 border-t-2 border-ink-900 shadow-2xl"
      role="dialog"
      aria-label="쿠키 동의"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Message */}
          <div className="flex-1">
            <div className="typewriter-label text-signal mb-1">
              — 쿠키 및 개인정보
            </div>
            <p className="body-text text-ink-900 text-sm leading-relaxed">
              AMATOR는 사이트 개선과 콘텐츠 추천을 위해 쿠키를 사용합니다.{' '}
              <Link
                to="/privacy"
                className="underline text-signal hover:text-ink-900 transition"
              >
                개인정보 처리방침
              </Link>
              을 확인하고 동의 여부를 선택해주세요.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 border border-ink-900 text-ink-900 typewriter-label hover:bg-ink-900/5 transition"
            >
              거부
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 bg-ink-900 text-cream-100 typewriter-label hover:bg-signal transition"
            >
              동의
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
