import { Link } from 'react-router-dom'
import { ALL_CATEGORIES, CATEGORY_SHORT_LABELS } from '../content/articles'
import { NewsletterInline } from './NewsletterInline'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-cream-100 border-t border-dashed border-ink-900/25 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Logo */}
        <div className="text-center">
          <div
            className="masthead text-ink-900 text-5xl md:text-6xl"
          >
            Saint-Rémy
          </div>
          <div className="headline-ko text-ink-500 text-base mt-3">
            평범한 사물을 깊이 보는 매거진
          </div>
        </div>

        {/* Newsletter — 푸터 내부 정상 흐름 (fixed 아님) */}
        <NewsletterInline />

        {/* Sitemap */}
        <div className="mt-10 pt-8 border-t border-dashed border-ink-900/25">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {/* 매거진 — 10개 카테고리 (articles.ts single source of truth) */}
            <div>
              <div className="typewriter-label text-ink-900 mb-2">매거진</div>
              <ul className="typewriter text-ink-500 space-y-1">
                {ALL_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/${cat}`}
                      className="hover:text-ink-900 uppercase"
                    >
                      {CATEGORY_SHORT_LABELS[cat]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 소개 (이전 '샵' 섹션 — 에디토리얼 매거진 포지셔닝) */}
            <div>
              <div className="typewriter-label text-ink-900 mb-2">소개</div>
              <ul className="typewriter text-ink-500 space-y-1">
                <li>
                  <Link to="/about" className="hover:text-ink-900">
                    ABOUT
                  </Link>
                </li>
              </ul>
            </div>

            {/* 팔로우 */}
            <div>
              <div className="typewriter-label text-ink-900 mb-2">팔로우</div>
              <ul className="typewriter text-ink-500 space-y-1">
                {/* TODO: saintremy.kr 공식 IG 개설 후 href 연결 */}
                <li>
                  <a
                    href="#"
                    aria-disabled="true"
                    className="hover:text-ink-900 opacity-60 cursor-not-allowed"
                    onClick={(e) => e.preventDefault()}
                  >
                    INSTAGRAM
                  </a>
                </li>
              </ul>
            </div>

            {/* 법적 */}
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
            Saint-Rémy는 쿠팡 파트너스, 무신사 파트너스, Amazon Associates 등
            어필리에이트 프로그램의 일환으로 제품 구매 시 일정 수수료를
            받을 수 있습니다. 이는 제품 추천 기준에 영향을 미치지 않습니다.{' '}
            <Link to="/terms" className="underline hover:text-ink-900">
              자세히 보기 →
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-dashed border-ink-900/25 flex flex-col md:flex-row justify-between items-center gap-2 typewriter text-ink-500">
          <div>© {year} DUCK DIVE · Saint-Rémy MAG</div>
          <div>ISSUE No.001 · COMING SPRING 2026</div>
        </div>
      </div>
    </footer>
  )
}
