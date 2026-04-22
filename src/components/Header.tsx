import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../content/articles'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 모바일 메뉴 열렸을 때 body 스크롤 잠금
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="w-full bg-cream-100 border-b border-dashed border-ink-900/30 relative">
      {/* ══════════════════════════════════════════════════════
          Top utility bar — 브랜드 정보 + 뉴스레터 CTA
          ══════════════════════════════════════════════════════ */}
      <div className="border-b border-ink-900/10">
        <div className="max-w-6xl mx-auto px-6 h-10 flex items-center justify-between">
          <div className="typewriter-label text-ink-500">
            DUCK DIVE · SEOUL
          </div>
          <div className="typewriter-label text-ink-500 hidden md:block">
            ISSUE No.001 · SPRING 2026
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          Masthead — 로고 + (데스크탑) 카테고리 네비게이션
          ══════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="flex items-center justify-between gap-6">
          {/* 로고 */}
          <Link
            to="/"
            className="group inline-block text-left flex-shrink-0"
            aria-label="AMATOR home"
          >
            <span
              className="block headline-italic text-ink-900 text-xl md:text-2xl font-normal"
              style={{ marginBottom: '-0.2em', marginLeft: '0.2em' }}
            >
              the
            </span>
            <span className="masthead block text-ink-900 text-5xl md:text-7xl lg:text-8xl leading-[0.9]">
              amator
            </span>
          </Link>

          {/* 데스크탑 카테고리 — 2열 그리드 */}
          <nav className="hidden md:block flex-1 max-w-md">
            <div className="grid grid-cols-5 gap-x-4 gap-y-2 text-right">
              {ALL_CATEGORIES.map((cat) => (
                <NavLink
                  key={cat}
                  to={`/${cat}`}
                  className={({ isActive }) =>
                    `headline-ko text-sm lg:text-base transition whitespace-nowrap ${
                      isActive
                        ? 'text-signal'
                        : 'text-ink-900 hover:text-signal'
                    }`
                  }
                >
                  {CATEGORY_LABELS[cat]}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* 모바일 햄버거 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
            aria-label="메뉴 열기"
          >
            <span
              className={`block h-0.5 w-full bg-ink-900 transition-transform ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-ink-900 transition-opacity ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-ink-900 transition-transform ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          Disclosure bar — 사이트 슬로건
          ══════════════════════════════════════════════════════ */}
      <div className="border-t border-dashed border-ink-900/30 hidden md:block">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <p className="typewriter text-ink-500 text-xs md:text-sm leading-relaxed text-center">
            그냥 좋아서 하는 사람들을 위한 매거진.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          모바일 풀스크린 메뉴
          ══════════════════════════════════════════════════════ */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-0 bg-cream-100 z-50 overflow-y-auto">
          <div className="px-6 py-5 flex items-center justify-between border-b border-dashed border-ink-900/30">
            <Link
              to="/"
              onClick={closeMenu}
              className="group inline-block text-left"
              aria-label="AMATOR home"
            >
              <span className="masthead block text-ink-900 text-4xl leading-[0.9]">
                amator
              </span>
            </Link>
            <button
              onClick={closeMenu}
              className="w-8 h-8 flex items-center justify-center text-ink-900"
              aria-label="메뉴 닫기"
            >
              <span className="block relative w-6 h-6">
                <span className="absolute top-1/2 left-0 w-full h-0.5 bg-ink-900 rotate-45" />
                <span className="absolute top-1/2 left-0 w-full h-0.5 bg-ink-900 -rotate-45" />
              </span>
            </button>
          </div>

          <nav className="px-6 py-8">
            <ul className="space-y-5">
              {ALL_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <NavLink
                    to={`/${cat}`}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `block headline-ko text-3xl transition ${
                        isActive ? 'text-signal' : 'text-ink-900'
                      }`
                    }
                  >
                    {CATEGORY_LABELS[cat]}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-10 pt-6 border-t border-dashed border-ink-900/30">
              <Link
                to="/shop"
                onClick={closeMenu}
                className="block typewriter-label text-signal text-xs mb-4"
              >
                SHOP →
              </Link>
              <Link
                to="/about"
                onClick={closeMenu}
                className="block typewriter-label text-ink-500 text-xs mb-4"
              >
                ABOUT →
              </Link>
              <p className="typewriter text-ink-500 text-xs leading-relaxed mt-8">
                그냥 좋아서 하는 사람들을 위한 매거진.
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}