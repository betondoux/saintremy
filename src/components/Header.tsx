import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ALL_CATEGORIES,
  CATEGORY_SUBCATEGORIES,
  CATEGORY_STICKER_COLORS,
  CATEGORY_SHORT_LABELS,
} from '../content/articles'
import logoUrl from '../assets/saintremy-logo.svg'

// ═══════════════════════════════════════════════════════════════
// 2026-04-24 design spec:
// [☰ 햄버거 | Saint-Rémy (italic 28px) | 🔍 검색] 3요소 미니멀 바.
// 유틸 바 (위) + 태그라인 (데스크톱만, 아래).
//
// 2026-04-25 update:
// 풀스크린 메뉴 블록을 The Strategist 스타일로 재설계.
// 형광 스티커 라벨 + 모노스페이스 서브카테고리 + 점선 구분선.
// ═══════════════════════════════════════════════════════════════

function StickerLabel({
  text,
  color,
  rotation,
}: {
  text: string
  color: string
  rotation: number
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        transform: `rotate(${rotation}deg)`,
        marginBottom: '14px',
      }}
    >
      <div
        style={{
          background: color,
          padding: '8px 22px 8px 18px',
          fontFamily: 'var(--font-display-en)',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: '20px',
          color: '#1a1a1a',
          clipPath:
            'polygon(0 8%, 96% 0, 100% 92%, 4% 100%, 0 80%, 5% 60%, 0 40%)',
        }}
      >
        {text}
      </div>
    </div>
  )
}

// 카테고리 12개 인덱스 → rotation 각도
const ROTATIONS = [-3, -2, -1.5, 2, -2, -1, 2.5, 1.5, -2, -1.5, 1, -2.5]

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
      {/* 유틸 바 — INSTAGRAM | SPRING 2026 (매거진 시즌 표기) */}
      <div style={{ borderBottom: '1px solid var(--sr-rule)' }}>
        <div
          className="max-w-6xl mx-auto px-4 md:px-6 py-2 flex items-center justify-between"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: 'var(--sr-ink)',
            textTransform: 'uppercase',
          }}
        >
          <a
            href="https://instagram.com/saintremy_kr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: 'inherit',
            }}
            className="hover:opacity-60 transition"
          >
            Instagram →
          </a>
          <span style={{ color: 'var(--sr-muted)' }}>
            Spring 2026
          </span>
        </div>
      </div>

      {/* 메인 바 */}
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <img
            src={logoUrl}
            alt="Saint-Rémy"
            style={{
              height: '56px',
              width: 'auto',
              display: 'block',
              maxWidth: '90vw',
            }}
          />
        </Link>

        <Link
          to="/search"
          aria-label="검색"
          onClick={closeMenu}
          className="w-10 h-10 flex items-center justify-center"
          style={{ color: 'var(--sr-ink)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      {/* 카테고리 상단 네비 — The Strategist 스타일 가로 스크롤 */}
      <nav
        className="overflow-x-auto no-scrollbar"
        style={{ borderBottom: '1px solid var(--sr-rule)' }}
        aria-label="카테고리 네비게이션"
      >
        <div
          className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-start md:justify-center gap-5 md:gap-7"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            paddingTop: '10px',
            paddingBottom: '10px',
            whiteSpace: 'nowrap',
          }}
        >
          {ALL_CATEGORIES.map((cat) => (
            <NavLink
              key={cat}
              to={`/${cat}`}
              onClick={closeMenu}
              style={({ isActive }) => ({
                color: isActive ? 'var(--sr-accent, #c44536)' : 'var(--sr-ink)',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 500,
              })}
              className="hover:opacity-60 transition"
            >
              {CATEGORY_SHORT_LABELS[cat]}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* 풀스크린 메뉴 — The Strategist 스타일 */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-0 z-50 overflow-y-auto"
          style={{ backgroundColor: 'var(--sr-bg)' }}
        >
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <nav
            className="max-w-3xl mx-auto px-6 pt-6 pb-12"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--sr-ink)',
            }}
          >
            {ALL_CATEGORIES.map((cat, idx) => {
              const subs = CATEGORY_SUBCATEGORIES[cat]
              const isLast = idx === ALL_CATEGORIES.length - 1
              return (
                <div key={cat}>
                  {idx > 0 && (
                    <div
                      style={{
                        borderTop: '1px dotted var(--sr-ink)',
                        margin: '8px 0 22px',
                        opacity: 0.4,
                      }}
                    />
                  )}

                  <NavLink
                    to={`/${cat}`}
                    onClick={closeMenu}
                    style={{ textDecoration: 'none' }}
                  >
                    <StickerLabel
                      text={CATEGORY_SHORT_LABELS[cat]}
                      color={CATEGORY_STICKER_COLORS[cat]}
                      rotation={ROTATIONS[idx] ?? 0}
                    />
                  </NavLink>

                  <div
                    style={{
                      paddingLeft: '2px',
                      fontSize: '13px',
                      lineHeight: 2,
                      letterSpacing: '0.01em',
                      paddingBottom: isLast ? 0 : '14px',
                    }}
                  >
                    {subs.length === 0 ? (
                      <div style={{ color: 'var(--sr-muted)', fontStyle: 'italic' }}>
                        Coming soon
                      </div>
                    ) : (
                      subs.map((sub) => (
                        <div key={sub}>
                          <NavLink
                            to={`/${cat}`}
                            onClick={closeMenu}
                            style={{
                              color: 'var(--sr-ink)',
                              textDecoration: 'none',
                              display: 'block',
                            }}
                            className="hover:opacity-60 transition"
                          >
                            {sub}
                          </NavLink>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}

            <div
              style={{
                borderTop: '1px dotted var(--sr-ink)',
                marginTop: '32px',
                paddingTop: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  lineHeight: 2.2,
                  letterSpacing: '0.05em',
                }}
              >
                <Link
                  to="/about"
                  onClick={closeMenu}
                  style={{ color: 'var(--sr-ink)', textDecoration: 'none', display: 'block' }}
                  className="hover:opacity-60 transition"
                >
                  About
                </Link>
                <Link
                  to="/search"
                  onClick={closeMenu}
                  style={{ color: 'var(--sr-ink)', textDecoration: 'none', display: 'block' }}
                  className="hover:opacity-60 transition"
                >
                  Search
                </Link>
                <a
                  href="https://instagram.com/saintremy_kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--sr-ink)', textDecoration: 'none', display: 'block' }}
                  className="hover:opacity-60 transition"
                >
                  Instagram
                </a>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-serif-kr)',
                  fontStyle: 'italic',
                  fontSize: '13px',
                  color: 'var(--sr-muted)',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px dotted var(--sr-ink)',
                }}
              >
                평범한 사물을 깊이 보는 매거진.
              </p>

              <div
                style={{
                  marginTop: '12px',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: 'var(--sr-muted)',
                }}
              >
                saintremy.kr · LLSV · 2026
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
