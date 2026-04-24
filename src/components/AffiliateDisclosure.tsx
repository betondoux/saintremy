// src/components/AffiliateDisclosure.tsx
// 쿠팡 파트너스 대가성 문구 고지. 공정위 심사 지침 준수.

export default function AffiliateDisclosure() {
  return (
    <aside
      className="affiliate-disclosure"
      role="note"
      aria-label="어필리에이트 고지"
    >
      <div className="affiliate-disclosure__inner">
        <span className="affiliate-disclosure__label">
          AD&nbsp;·&nbsp;DISCLOSURE
        </span>
        <span className="affiliate-disclosure__text">
          쿠팡 파트너스 활동으로 일정 수수료를 받습니다.
        </span>
      </div>
    </aside>
  )
}