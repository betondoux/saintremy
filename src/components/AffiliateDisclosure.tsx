// src/components/AffiliateDisclosure.tsx
// 쿠팡 파트너스 대가성 문구 고지. 공정위 심사 지침 준수.

export default function AffiliateDisclosure() {
  return (
    <aside
      className="affiliate-disclosure"
      role="note"
      aria-label="어필리에이트 고지"
    >
      <div className="affiliate-disclosure__divider" />
      <div className="affiliate-disclosure__inner">
        <span className="affiliate-disclosure__label">
          AFFILIATE&nbsp;&middot;&nbsp;DISCLOSURE
        </span>
        <p className="affiliate-disclosure__text">
          이 게시물은 쿠팡 파트너스 활동의 일환으로,
          <br />
          이에 따른 일정액의 수수료를 제공받습니다.
        </p>
      </div>
      <div className="affiliate-disclosure__divider" />
    </aside>
  )
}