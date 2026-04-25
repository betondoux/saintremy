/**
 * /admin 좌측 사이드바 (Studio 흡수 후 통합).
 *
 * - 너비 240px, position: fixed
 * - 카테고리: 개요 / 콘텐츠 / 수익 / 유입 / 실험 / 관리
 * - 활성 메뉴: 좌측 3px 골드 바 + bg-card-hover
 * - 하단: API 비용(로컬 cost-tracker) + 외부 saintremy.kr + 로그아웃
 */
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/api'

interface NavItem {
  to: string
  label: string
  icon: string
  badge?: string | number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

function buildGroups(draftCount: number | null): NavGroup[] {
  return [
    {
      title: '개요',
      items: [
        { to: '/overview', label: 'Overview', icon: '◧' },
        { to: '/realtime', label: 'Realtime', icon: '◉' },
      ],
    },
    {
      title: '콘텐츠',
      items: [
        { to: '/new', label: '새 기사', icon: '✎' },
        {
          to: '/dashboard',
          label: '진행 중',
          icon: '▦',
          badge: draftCount !== null && draftCount > 0 ? draftCount : undefined,
        },
        { to: '/articles', label: 'Articles', icon: '▤' },
        { to: '/products', label: 'Products', icon: '⌬' },
      ],
    },
    {
      title: '수익',
      items: [
        { to: '/partners', label: 'Partners', icon: '◈' },
        { to: '/funnel', label: 'Funnel', icon: '▽' },
      ],
    },
    {
      title: '유입',
      items: [{ to: '/traffic', label: 'Traffic', icon: '⌁' }],
    },
    {
      title: '실험',
      items: [{ to: '/ab-tests', label: 'A/B Tests', icon: '⇄' }],
    },
    {
      title: '관리',
      items: [
        { to: '/content-health', label: 'Content Health', icon: '♡' },
        { to: '/settings', label: 'Settings', icon: '⚙' },
      ],
    },
  ]
}

export function Sidebar() {
  const navigate = useNavigate()
  const [draftCount, setDraftCount] = useState<number | null>(null)
  const [costUsd, setCostUsd] = useState<number | null>(null)
  const [costMode, setCostMode] = useState<'mock' | 'live' | 'unknown'>('unknown')
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let alive = true
    adminFetch<{
      stats: { drafts_in_progress: number }
      cost?: { total_usd: number; mode: 'mock' | 'live' }
    }>('/api/admin/dashboard')
      .then((d) => {
        if (!alive) return
        setDraftCount(d.stats.drafts_in_progress)
        if (d.cost) {
          setCostUsd(d.cost.total_usd)
          setCostMode(d.cost.mode)
        }
      })
      .catch(() => {
        // 401 등은 api.ts가 redirect; 사이드바는 조용히 무시
      })
    return () => {
      alive = false
    }
  }, [])

  async function logout() {
    setLoggingOut(true)
    try {
      await adminFetch('/api/admin/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const groups = buildGroups(draftCount)

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 240,
        height: '100vh',
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px 16px',
        zIndex: 10,
      }}
    >
      <div style={{ marginBottom: 24, padding: '0 4px' }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}
        >
          Saint-Rémy
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: 2,
            fontWeight: 600,
          }}
        >
          Studio
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {groups.map((group) => (
          <div key={group.title}>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 600,
                padding: '0 6px',
                marginBottom: 6,
              }}
            >
              {group.title}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
                    }
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      paddingLeft: isActive ? 7 : 10, // 3px reserved for active bar
                      borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                      borderRadius: '0 6px 6px 0',
                      fontSize: 13,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--bg-card)' : 'transparent',
                      transition: 'background 0.15s, color 0.15s',
                      textDecoration: 'none',
                    })}
                  >
                    <span
                      style={{
                        width: 16,
                        textAlign: 'center',
                        color: 'var(--text-tertiary)',
                        fontSize: 14,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        style={{
                          background: 'var(--accent)',
                          color: '#1a1208',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: 99,
                          minWidth: 18,
                          textAlign: 'center',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 12,
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 6px',
          }}
          title="Anthropic API 누적 비용 (이번 세션)"
        >
          <span>API 누적</span>
          <span className="num" style={{ color: 'var(--text-secondary)' }}>
            {costUsd !== null ? `$${costUsd.toFixed(2)}` : '—'}
            {costMode === 'mock' && (
              <span style={{ color: 'var(--accent)', marginLeft: 4 }}>(mock)</span>
            )}
          </span>
        </div>

        <a
          href="https://saintremy.kr"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            padding: '6px',
            textDecoration: 'none',
          }}
        >
          ↗ saintremy.kr
        </a>

        <button
          onClick={logout}
          disabled={loggingOut}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '7px 10px',
            borderRadius: 6,
            fontSize: 12,
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            opacity: loggingOut ? 0.5 : 1,
            textAlign: 'left',
          }}
        >
          {loggingOut ? '로그아웃 중…' : '로그아웃'}
        </button>
      </div>
    </aside>
  )
}
