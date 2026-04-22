import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10 pb-8 border-b border-dashed border-ink-900/25 text-center">
        <div className="typewriter-label text-signal mb-3">— 법적 고지</div>
        <h1 className="masthead text-5xl md:text-6xl text-ink-900 leading-none">
          Privacy
        </h1>
        <p className="body-text text-ink-500 mt-4">
          개인정보 처리방침 · 최종 업데이트 2026년 4월 21일
        </p>
      </header>

      <div className="article-body space-y-6 body-text text-ink-900 text-base leading-relaxed">
        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            1. 개인정보의 처리 목적
          </h2>
          <p>
            DUCK DIVE(이하 "운영자")가 운영하는 Saint-Rémy(saintremy.kr, 이하 "사이트")는 다음과
            같은 목적으로 개인정보를 수집 및 처리합니다.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>뉴스레터 발송 및 구독 관리</li>
            <li>사이트 이용 통계 분석 및 서비스 개선</li>
            <li>맞춤형 콘텐츠 및 광고 제공</li>
            <li>문의 및 피드백에 대한 응답</li>
          </ul>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            2. 처리하는 개인정보 항목
          </h2>
          <p>
            사이트는 최소한의 개인정보만 수집하며, 다음 항목을 처리합니다.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>
              <strong>필수항목:</strong> 이메일 주소 (뉴스레터 구독 시)
            </li>
            <li>
              <strong>자동수집항목:</strong> IP 주소, 쿠키, 접속 로그, 기기
              정보, 방문 페이지
            </li>
          </ul>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>뉴스레터 이메일: 구독 해지 시까지</li>
            <li>쿠키 및 로그 데이터: 최대 1년</li>
            <li>법령에 따라 보존이 필요한 경우: 해당 법령에서 정하는 기간</li>
          </ul>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            4. 개인정보의 제3자 제공
          </h2>
          <p>
            운영자는 다음의 외부 서비스를 사용하여 사이트를 운영하며, 이들
            서비스에 일부 정보가 전달될 수 있습니다.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>
              <strong>Cloudflare Pages</strong> — 사이트 호스팅 및 보안 (IP
              주소, 접속 로그)
            </li>
            <li>
              <strong>Google Analytics</strong> — 사용 통계 분석 (익명화된
              방문 데이터)
            </li>
            <li>
              <strong>Google AdSense</strong> — 맞춤형 광고 제공 (쿠키 기반)
            </li>
            <li>
              <strong>Buttondown</strong> — 뉴스레터 발송 (이메일 주소)
            </li>
            <li>
              <strong>Notion</strong> — 콘텐츠 관리 시스템
            </li>
          </ul>
          <p className="mt-3">
            이 외 어떠한 제3자에게도 개인정보를 판매하거나 제공하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            5. 쿠키(Cookie)의 운영 및 거부
          </h2>
          <p>
            사이트는 사용자 경험 개선을 위해 쿠키를 사용합니다. 사용자는 다음
            방법으로 쿠키 사용을 거부할 수 있습니다.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>사이트 최초 방문 시 표시되는 쿠키 배너에서 "거부" 선택</li>
            <li>브라우저 설정에서 쿠키 차단</li>
            <li>Google 광고 설정에서 개인 맞춤 광고 거부</li>
          </ul>
          <p className="mt-3">
            쿠키를 거부해도 사이트의 대부분 기능을 이용할 수 있으나, 맞춤형
            광고 및 일부 기능이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            6. 어필리에이트 고지
          </h2>
          <p>
            Saint-Rémy는 쿠팡 파트너스, 무신사 파트너스, Amazon Associates,
            브랜드 직접 제휴 등의 어필리에이트 프로그램에 참여하고 있으며,
            사이트 내 상품 링크를 통해 구매가 이루어질 경우 일정 금액의
            수수료를 제공받을 수 있습니다. 이는 사이트 운영비로 사용됩니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            7. 정보주체의 권리 및 행사 방법
          </h2>
          <p>이용자는 다음의 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>개인정보 열람 요구</li>
            <li>오류 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리 정지 요구</li>
          </ul>
          <p className="mt-3">
            위 권리 행사는 아래 연락처로 요청 가능합니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            8. 개인정보 보호 책임자
          </h2>
          <div className="p-5 bg-cream-200/50 border border-ink-900/20 mt-3">
            <p className="mb-1">
              <strong>운영자:</strong> DUCK DIVE (김태원)
            </p>
            <p className="mb-1">
              <strong>이메일:</strong>{' '}
              <a
                href="mailto:lonelyjar2@gmail.com"
                className="text-signal underline"
              >
                lonelyjar2@gmail.com
              </a>
            </p>
            <p>
              <strong>사이트:</strong>{' '}
              <Link to="/" className="text-signal underline">
                saintremy.kr
              </Link>
            </p>
          </div>
        </section>

        <section>
          <h2 className="headline text-xl md:text-2xl text-ink-900 mt-8 mb-3">
            9. 처리방침의 변경
          </h2>
          <p>
            본 처리방침은 2026년 4월 21일부터 적용되며, 법령 및 방침에 따라
            변경될 수 있습니다. 변경 시 사이트 공지를 통해 알려드립니다.
          </p>
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
