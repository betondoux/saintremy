// src/components/sidebar/NewsletterCTA.tsx
// The Strategist 스타일 "Weekly" 사이드바 뉴스레터 — ink bg + white CTA.
// Phase 3 에서 ConvertKit/Mailchimp 연동 예정.

import { useState } from 'react'

export default function NewsletterCTA() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    alert('곧 실제 구독 시스템과 연동됩니다')
  }

  return (
    <aside
      className="p-6 rounded-lg"
      style={{ backgroundColor: '#0A0A0B', color: '#FFFFFF' }}
    >
      <div
        className="font-bold mb-3"
        style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
        }}
      >
        📨 SAINT-RÉMY WEEKLY
      </div>
      <h3 className="font-serif leading-snug mb-2" style={{ fontSize: '20px' }}>
        에디터가 이번 주 검증한 제품만
      </h3>
      <p
        className="mb-4"
        style={{ fontSize: '14px', color: '#CFCBC5', lineHeight: 1.6 }}
      >
        매주 금요일, 수십 개 제품 중 살 만한 것만 골라 보내드립니다.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          aria-label="이메일 주소"
          className="w-full px-3 py-2 rounded text-sm focus:outline-none"
          style={{ backgroundColor: '#FFFFFF', color: '#0A0A0B' }}
        />
        <button
          type="submit"
          className="w-full py-2 rounded text-sm font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FFFFFF', color: '#0A0A0B' }}
        >
          구독하기
        </button>
      </form>
    </aside>
  )
}
