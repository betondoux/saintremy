import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
} from '../content/articles'

// ═══════════════════════════════════════════════════════════════
// 2026-04-24 design spec:
// [☰ 햄버거 | Saint-Rémy (italic 28px) | 🔍 검색] 3요소 미니멀 바.
// 유틸 바 (위) + 태그라인 (데스크톱만, 아래).
// 데스크톱에서도 동일 3요소 유지 — 카테고리 네비는 모바일 메뉴로 통합.
// ═══════════════════════════════════════════════════════════════
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    <header
      className="w-full sticky top-0 z-40"
      style={{ backgroundColor: 'var(--sr-bg)' }}
    >
      {/* 유틸 바 */}
      <div style={{ borderBottom: '1px solid var(--sr-rule)' }}>
        <div
          className="max-w-6xl mx-auto px-4 md:px-6 py-2 flex items-center justify-between"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: 'var(--sr-muted)',
          }}
        >
          <span>LLSV · SEOUL</span>
          <span>ISSUE NO.001 · SPRING 2026</span>
        </div>
      </div>

      {/* 메인 바 — 햄버거 | 로고 | 검색 */}
      <div
        className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between"
        style={{
          borderBottom: '1px solid var(--sr-rule)',
          paddingTop: '16px',
          paddingBottom: '16px',
        }}
      >
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          className="w-10 h-10 flex items-center justify-center"
          style={{ color: 'var(--sr-ink)' }}
        >
          {isMenuOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          )}
        </button>

        <Link
          to="/"
          aria-label="Saint-Rémy home"
          onClick={closeMenu}
          style={{
            fontFamily: 'var(--font-display-en)',
            fontSize: '28px',
            fontStyle: 'italic',
            fontWeight: 700,
            color: 'var(--sr-ink)',
            letterSpacing: '-0.01em',
          }}
        >
          Saint-Rémy
        </Link>

        <Link
          to="/search"
          aria-label="검색"
          onClick={closeMenu}
          className="w-10 h-10 flex items-center justify-center"
          style={{ color: 'var(--sr-ink)' }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      {/* 태그라인 (데스크톱만) */}
      <div
        className="hidden md:block text-center py-3"
        style={{
          fontFamily: 'var(--font-serif-kr)',
          fontStyle: 'italic',
          fontSize: '13px',
          color: 'var(--sr-muted)',
          borderBottom: '1px solid var(--sr-rule)',
        }}
      >
        평범한 사물을 깊이 보는 매거진.
      </div>

      {/* 풀스크린 메뉴 (모든 뷰포트) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-0 z-50 overflow-y-auto"
          style={{ backgroundColor: 'var(--sr-bg)' }}
        >
          {/* 메뉴 헤더 — 닫기 버튼만 */}
          <div
            className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--sr-rule)' }}
          >
            <Link
              to="/"
              onClick={closeMenu}
              aria-label="Saint-Rémy home"
              style={{
                fontFamily: 'var(--font-display-en)',
                fontSize: '28px',
                fontStyle: 'italic',
                fontWeight: 700,
                color: 'var(--sr-ink)',
              }}
            >
              Saint-Rémy
            </Link>
            <button
              onClick={closeMenu}
              aria-label="메뉴 닫기"
              className="w-10 h-10 flex items-center justify-center"
              style={{ color: 'var(--sr-ink)' }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <nav className="max-w-6xl mx-auto px-6 py-8">
            <ul className="space-y-5">
              {ALL_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <NavLink
                    to={`/${cat}`}
                    onClick={closeMenu}
                    className="block transition hover:opacity-60"
                    style={{
                      fontFamily: 'var(--font-serif-kr)',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: 'var(--sr-ink)',
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div
              className="mt-10 pt-6"
              style={{ borderTop: '1px solid var(--sr-rule)' }}
            >
              <Link
                to="/about"
                onClick={closeMenu}
                className="block mb-4 hover:opacity-60 transition"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  letterSpacing: '0.2em',
                  color: 'var(--sr-muted)',
                }}
              >
                ABOUT →
              </Link>
              <Link
                to="/search"
                onClick={closeMenu}
                className="block mb-4 hover:opacity-60 transition"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  letterSpacing: '0.2em',
                  color: 'var(--sr-muted)',
                }}
              >
                SEARCH →
              </Link>
              <p
                className="mt-8"
                style={{
                  fontFamily: 'var(--font-serif-kr)',
                  fontStyle: 'italic',
                  fontSize: '13px',
                  color: 'var(--sr-muted)',
                }}
              >
                평범한 사물을 깊이 보는 매거진.
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
