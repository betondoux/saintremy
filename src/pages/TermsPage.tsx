import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10 pb-8 border-b border-dashed border-ink-900/25 text-center">
        <div className="typewriter-label text-signal mb-3">— 법적 고지</div>
        <h1 className="masthead text-5xl md:text-6xl text-ink-900 leading-none">
          Terms
        </h1>
        <p className="body-text text-ink-500 mt-4">
          이용약관 · 최종 업데이트 2026년 4월 21일
        </p>
      </header>

      <div className="article-body space-y-6 body-text text-ink-900 text-base leading-relaxed">
        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            제1조 (목적)
          </h2>
          <p>
            본 약관은 DUCK DIVE(이하 "운영자")가 제공하는 Saint-Rémy(saintremy.kr,
            이하 "사이트") 이용과 관련하여 운영자와 이용자의 권리, 의무 및
            책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            제2조 (어필리에이트 공시)
          </h2>
          <p>
            <strong>
              Saint-Rémy는 어필리에이트 마케팅 프로그램 참여 매체입니다.
            </strong>
          </p>
          <p className="mt-3">
            사이트 내 상품 리뷰, 추천, 가이드 등에 포함된 외부 상품 링크는
            어필리에이트 링크일 수 있으며, 이를 통해 구매가 이루어질 경우
            운영자는 해당 파트너로부터 일정 금액의 수수료를 받을 수 있습니다.
          </p>
          <p className="mt-3">
            <strong>참여 프로그램:</strong>
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>쿠팡 파트너스</li>
            <li>무신사 파트너스</li>
            <li>Amazon Associates</li>
            <li>기타 브랜드 공식 제휴 프로그램</li>
          </ul>
          <p className="mt-3">
            단, <strong>편집 독립성</strong>을 유지하기 위해 수수료율에
            상관없이 진정으로 추천할 만한 상품만 소개합니다. 모든 리뷰와
            추천은 편집팀의 독립적 판단에 따른 것이며, 어떠한 브랜드의 후원을
            받아 작성된 콘텐츠도 협찬 표시와 함께 공개됩니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            제3조 (콘텐츠 저작권)
          </h2>
          <p>
            사이트 내 기사, 영상, 이미지, 디자인 등 모든 콘텐츠의 저작권은
            운영자 또는 정당한 권리자에게 있습니다. 이용자는 개인적, 비영리적
            목적으로만 콘텐츠를 이용할 수 있으며, 상업적 이용이나 무단 복제,
            배포는 금지됩니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            제4조 (금지 행위)
          </h2>
          <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>사이트의 안정적 운영을 저해하는 행위</li>
            <li>타인의 개인정보를 수집하거나 공개하는 행위</li>
            <li>콘텐츠를 무단으로 복제, 전재, 배포하는 행위</li>
            <li>스팸, 악성 코드, 해킹 시도 등</li>
          </ul>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            제5조 (면책 조항)
          </h2>
          <p>
            사이트에 게재된 정보는 일반적인 안내 목적이며, 의학적 조언이
            아닙니다. 개인의 건강 상태에 따라 결과가 다를 수 있으므로, 중요한
            건강 관련 결정은 반드시 전문가(의사, 전문 트레이너 등)와 상담 후
            결정하시기 바랍니다.
          </p>
          <p className="mt-3">
            외부 링크로 연결된 쇼핑몰에서의 구매, 배송, 환불, 교환 등에 관한
            책임은 해당 쇼핑몰에 있으며, 운영자는 이에 대한 책임을 지지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            제6조 (분쟁 해결)
          </h2>
          <p>
            사이트 이용과 관련하여 발생한 분쟁은 대한민국 법을 준거법으로
            하며, 서울중앙지방법원을 제1심 관할 법원으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            제7조 (약관의 변경)
          </h2>
          <p>
            본 약관은 운영자의 판단에 따라 변경될 수 있으며, 변경 시 사이트를
            통해 공지합니다. 변경된 약관은 공지 후 7일이 경과한 때부터 효력이
            발생합니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            문의
          </h2>
          <div className="p-5 bg-cream-200/50 border border-ink-900/20 mt-3">
            <p className="mb-1">
              <strong>운영자:</strong> DUCK DIVE (김태원)
            </p>
            <p>
              <strong>이메일:</strong>{' '}
              <a
                href="mailto:lonelyjar2@gmail.com"
                className="text-signal underline"
              >
                lonelyjar2@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t-2 border-ink-900 text-center">
        <Link
          to="/"
          className="typewriter-label text-signal hover:underline"
        >
          ← 홈으로
        </Link>
      </div>
    </div>
  )
}
