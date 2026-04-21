import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'amator_nl_dismissed'
const SESSION_KEY = 'amator_nl_session'

/**
 * NewsletterBottomBar — 하단 고정 뉴스레터 가입 바.
 *
 * 동작:
 * - 페이지 스크롤 50% 이후 자동 표시
 * - 사용자가 닫으면 세션 동안 숨김 (sessionStorage)
 * - "영원히 닫기" 버튼 클릭 시 localStorage에 저장 (30일)
 *
 * 디자인:
 * - Strategist의 노란 팝업처럼 강렬한 warming 색상
 * - 왼쪽 라벨 + 중앙 메시지 + 오른쪽 이메일 입력 + 닫기
 */
export function NewsletterBottomBar() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // 이미 영구 닫힘
    if (typeof window === 'undefined') return

    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const daysAgo = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysAgo < 30) return // 30일 내면 숨김
    }

    // 세션 내에서 닫았는지
    if (sessionStorage.getItem(SESSION_KEY)) return

    // 스크롤 50% 감지
    const onScroll = () => {
      const scrolled = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      if (scrolled / max > 0.5) {
        setVisible(true)
        window.removeEventListener('scroll', onScroll)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // TODO: Buttondown API 연결
    setSubmitted(true)
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem(SESSION_KEY, '1')
    }, 2000)
  }

  const handleClose = () => {
    setVisible(false)
    sessionStorage.setItem(SESSION_KEY, '1')
  }

  const handlePermanentClose = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-warming shadow-2xl border-t-4 border-ink-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-5">
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 w-8 h-8 flex items-center justify-center text-ink-900 hover:bg-ink-900/10 transition rounded-full"
          aria-label="닫기"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4 4L14 14M14 4L4 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="typewriter-label text-ink-900 mb-1">
              — 구독 완료
            </div>
            <p className="headline-italic text-xl text-ink-900">
              매주 목요일, 당신의 받은 편지함에서 만나요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Left — Label */}
            <div className="md:pr-6 md:border-r md:border-ink-900/20">
              <div className="typewriter-label text-ink-900 mb-0 text-xs">
                좋은 글, 좋은 딜
              </div>
              <div className="headline-italic text-xl md:text-2xl text-ink-900 leading-tight">
                매주 한 편.
              </div>
            </div>

            {/* Center — Message */}
            <div className="flex-1 body-text text-ink-900 text-sm md:text-base leading-snug">
              운동하는 사람들, 그냥 좋아서 하는 사람들을 위한 매거진.
              <br className="hidden md:inline" />
              매주 목요일, 아마토르의 추천 기사 + 딜 + 기어.
            </div>

            {/* Right — Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:min-w-[300px]"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                className="flex-1 px-4 py-2 bg-cream-100 border-2 border-ink-900 typewriter text-ink-900 placeholder:text-ink-500 focus:outline-none focus:bg-white"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-ink-900 text-cream-100 typewriter-label hover:bg-signal transition whitespace-nowrap"
              >
                구독
              </button>
            </form>
          </div>
        )}

        {/* Permanent dismissal link (very subtle) */}
        {!submitted && (
          <div className="text-center mt-2 md:mt-1">
            <button
              onClick={handlePermanentClose}
              className="typewriter text-ink-700 text-[10px] hover:underline"
            >
              30일간 표시 안 함
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
