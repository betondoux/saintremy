/**
 * Header — 매거진 톤 (032c × 모던 이커머스 라운드 nav).
 * 좌: SAINT-RÉMY wordmark · 중앙: 둥근 흰 박스 nav · 우: SEARCH
 * 모바일은 햄버거 → fullscreen menu.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/story', label: 'STORIES' },
  { to: '/style', label: 'STYLE' },
  { to: '/space', label: 'SPACE' },
  { to: '/travel', label: 'TRAVEL' },
  { to: '/music', label: 'MUSIC' },
  { to: '/about', label: 'ABOUT' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-900/[0.06]">
        <div className="flex items-center justify-between px-5 md:px-10 py-3.5 md:py-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-ink-900 tracking-[-0.04em] leading-none"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.15rem, 2.5vw, 1.55rem)',
            }}
          >
            SAINT-RÉMY
          </Link>

          {/* Desktop nav — 라운드 박스 nav */}
          <nav className="hidden md:flex items-center gap-1 bg-ink-900/[0.04] rounded-full px-2 py-1.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.22em] rounded-full transition-colors ${
                    isActive
                      ? 'bg-ink-900 text-white'
                      : 'text-ink-700 hover:bg-white hover:text-ink-900'
                  }`
                }
                style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Search + Mobile menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink-900/[0.04] hover:bg-ink-900 hover:text-white transition-colors text-ink-900"
              aria-label="Search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink-900/[0.04] hover:bg-ink-900 hover:text-white transition-colors text-ink-900"
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-6 overflow-y-auto">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="block py-4 border-b border-ink-900/10 text-ink-900 uppercase"
                style={{
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(2rem, 8vw, 3rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-12 text-[0.7rem] uppercase tracking-[0.3em] text-ink-500" style={{ fontFamily: 'Pretendard, sans-serif' }}>
            SAINT-RÉMY · LESS, BUT DEEPER
          </div>
        </div>
      )}
    </>
  )
}
