import { useState } from 'react'

/**
 * NewsletterInline — 기사 본문 중간에 자연스럽게 삽입되는 뉴스레터 가입 박스.
 *
 * 디자인:
 * - 에디토리얼 매거진 스타일 (광고 느낌 없음)
 * - 점선 테두리 + cream 배경
 * - 간결한 한 문장 메시지 + 이메일 입력
 */
export function NewsletterInline() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // TODO: Buttondown API 연결
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <aside className="my-12 py-8 px-6 border-y-2 border-ink-900 bg-cream-200/50 text-center">
        <div className="typewriter-label text-signal mb-2">— 구독 완료</div>
        <p className="headline-italic text-xl text-ink-900">
          매주 목요일, 받은 편지함에서 만나요.
        </p>
      </aside>
    )
  }

  return (
    <aside className="my-12 py-8 px-6 md:px-10 border-y-2 border-ink-900 bg-cream-200/50">
      <div className="max-w-xl mx-auto text-center">
        <div className="typewriter-label text-signal mb-3">
          — WEEKLY DISPATCH
        </div>
        <h3 className="headline-italic text-2xl md:text-3xl text-ink-900 leading-tight mb-3">
          Saint-Rémy를 매주 받아보세요.
        </h3>
        <p className="body-text text-ink-500 text-sm mb-5 leading-relaxed">
          덜 사고 더 잘 쓰는 사람들의 이메일. 매주 목요일, 한 통.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            className="flex-1 px-4 py-3 bg-cream-100 border-2 border-ink-900 typewriter text-ink-900 placeholder:text-ink-500 focus:outline-none focus:bg-white"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-ink-900 text-cream-100 typewriter-label hover:bg-signal transition whitespace-nowrap"
          >
            구독하기
          </button>
        </form>
        <p className="typewriter text-ink-400 text-[10px] mt-3">
          언제든 한 번의 클릭으로 구독 취소 가능합니다.
        </p>
      </div>
    </aside>
  )
}
