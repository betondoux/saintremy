import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-cream-100 border-t border-dashed border-ink-900/25 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Logo */}
        <div className="text-center">
          <div className="headline-italic text-ink-500 text-xl">the</div>
          <div
            className="masthead text-ink-900 text-6xl md:text-7xl"
            style={{ marginTop: '-0.1em' }}
          >
            amator
          </div>
          <div className="headline-ko text-ink-500 text-base mt-2">
            그냥 좋아서 하는 사람
          </div>
        </div>

        {/* Sitemap */}
        <div className="mt-10 pt-8 border-t border-dashed border-ink-900/25">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div>
              <div className="typewriter-label text-ink-900 mb-2">매거진</div>
              <ul className="typewriter text-ink-500 space-y-1">
                <li>
                  <Link to="/lift" className="hover:text-ink-900">
                    LIFT
                  </Link>
                </li>
                <li>
                  <Link to="/combat" className="hover:text-ink-900">
                    COMBAT
                  </Link>
                </li>
                <li>
                  <Link to="/football" className="hover:text-ink-900">
                    FOOTBALL
                  </Link>
                </li>
                <li>
                  <Link to="/run" className="hover:text-ink-900">
                    RUN
                  </Link>
                </li>
                <li>
                  <Link to="/flow" className="hover:text-ink-900">
                    FLOW
                  </Link>
                </li>
                <li>
                  <Link to="/court" className="hover:text-ink-900">
                    COURT
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="typewriter-label text-ink-900 mb-2">샵</div>
              <ul className="typewriter text-ink-500 space-y-1">
                <li>
                  <Link to="/shop" className="hover:text-ink-900">
                    ALL PRODUCTS
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-ink-900">
                    ABOUT
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="typewriter-label text-ink-900 mb-2">팔로우</div>
              <ul className="typewriter text-ink-500 space-y-1">
                <li>
                  <a
                    href="https://instagram.com/amator.kr"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ink-900"
                  >
                    INSTAGRAM
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/@amator.kr"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ink-900"
                  >
                    YOUTUBE
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="typewriter-label text-ink-900 mb-2">법적</div>
              <ul className="typewriter text-ink-500 space-y-1">
                <li>
                  <Link to="/privacy" className="hover:text-ink-900">
                    PRIVACY
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-ink-900">
                    TERMS
                  </Link>
                </li>
                <li>lonelyjar2@gmail.com</li>
                <li>SEOUL · KOREA</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Affiliate disclosure */}
        <div className="mt-10 pt-6 border-t border-dashed border-ink-900/25">
          <p className="typewriter text-ink-400 text-xs leading-relaxed text-center max-w-2xl mx-auto">
            AMATOR는 쿠팡 파트너스, 무신사 파트너스, Amazon Associates 등
            어필리에이트 프로그램의 일환으로 제품 구매 시 일정 수수료를
            받을 수 있습니다. 이는 제품 추천 기준에 영향을 미치지 않습니다.{' '}
            <Link to="/terms" className="underline hover:text-ink-900">
              자세히 보기 →
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-dashed border-ink-900/25 flex flex-col md:flex-row justify-between items-center gap-2 typewriter text-ink-500">
          <div>© {year} DUCK DIVE · AMATOR MAG</div>
          <div>ISSUE No.001 · SPRING 2026</div>
        </div>
      </div>
    </footer>
  )
}
