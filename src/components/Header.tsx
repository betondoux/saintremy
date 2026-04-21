import { Link, NavLink } from 'react-router-dom'

export function Header() {
  return (
    <header className="w-full bg-cream-100 border-b border-dashed border-ink-900/30">
      {/* Top utility bar */}
      <div className="border-b border-ink-900/10">
        <div className="max-w-6xl mx-auto px-6 h-10 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 typewriter-label text-ink-500 overflow-x-auto no-scrollbar">
            <NavLink
              to="/lift"
              className={({ isActive }) =>
                isActive ? 'text-ink-900' : 'hover:text-ink-900 transition whitespace-nowrap'
              }
            >
              LIFT
            </NavLink>
            <span className="opacity-40">·</span>
            <NavLink
              to="/combat"
              className={({ isActive }) =>
                isActive ? 'text-ink-900' : 'hover:text-ink-900 transition whitespace-nowrap'
              }
            >
              COMBAT
            </NavLink>
            <span className="opacity-40">·</span>
            <NavLink
              to="/football"
              className={({ isActive }) =>
                isActive ? 'text-ink-900' : 'hover:text-ink-900 transition whitespace-nowrap'
              }
            >
              FOOTBALL
            </NavLink>
            <span className="opacity-40">·</span>
            <NavLink
              to="/run"
              className={({ isActive }) =>
                isActive ? 'text-ink-900' : 'hover:text-ink-900 transition whitespace-nowrap'
              }
            >
              RUN
            </NavLink>
            <span className="opacity-40">·</span>
            <NavLink
              to="/flow"
              className={({ isActive }) =>
                isActive ? 'text-ink-900' : 'hover:text-ink-900 transition whitespace-nowrap'
              }
            >
              FLOW
            </NavLink>
            <span className="opacity-40">·</span>
            <NavLink
              to="/court"
              className={({ isActive }) =>
                isActive ? 'text-ink-900' : 'hover:text-ink-900 transition whitespace-nowrap'
              }
            >
              COURT
            </NavLink>
            <span className="opacity-40">·</span>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                isActive
                  ? 'text-signal font-bold whitespace-nowrap'
                  : 'text-signal hover:text-ink-900 transition font-bold whitespace-nowrap'
              }
            >
              SHOP
            </NavLink>
          </div>
          <div className="typewriter-label text-ink-500 hidden md:block whitespace-nowrap">
            DUCK DIVE · SEOUL
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <Link
            to="/"
            className="group inline-block text-left"
            aria-label="AMATOR home"
          >
            <span
              className="block headline-italic text-ink-900 text-2xl md:text-3xl font-normal"
              style={{ marginBottom: '-0.25em', marginLeft: '0.25em' }}
            >
              the
            </span>
            <span className="masthead block text-ink-900 text-6xl md:text-8xl lg:text-9xl leading-[0.9]">
              amator
            </span>
          </Link>

          {/* Category grid — 2 columns */}
          <nav className="pt-4 md:pt-8">
            <div className="grid grid-cols-2 gap-x-10 md:gap-x-14 gap-y-2 text-center md:text-left">
              <NavLink
                to="/lift"
                className={({ isActive }) =>
                  `headline text-base md:text-lg transition ${
                    isActive ? 'text-signal' : 'text-ink-900 hover:text-signal'
                  }`
                }
              >
                Lift
              </NavLink>
              <NavLink
                to="/combat"
                className={({ isActive }) =>
                  `headline text-base md:text-lg transition ${
                    isActive ? 'text-signal' : 'text-ink-900 hover:text-signal'
                  }`
                }
              >
                Combat
              </NavLink>
              <NavLink
                to="/football"
                className={({ isActive }) =>
                  `headline text-base md:text-lg transition ${
                    isActive ? 'text-signal' : 'text-ink-900 hover:text-signal'
                  }`
                }
              >
                Football
              </NavLink>
              <NavLink
                to="/run"
                className={({ isActive }) =>
                  `headline text-base md:text-lg transition ${
                    isActive ? 'text-signal' : 'text-ink-900 hover:text-signal'
                  }`
                }
              >
                Run
              </NavLink>
              <NavLink
                to="/flow"
                className={({ isActive }) =>
                  `headline text-base md:text-lg transition ${
                    isActive ? 'text-signal' : 'text-ink-900 hover:text-signal'
                  }`
                }
              >
                Flow
              </NavLink>
              <NavLink
                to="/court"
                className={({ isActive }) =>
                  `headline text-base md:text-lg transition ${
                    isActive ? 'text-signal' : 'text-ink-900 hover:text-signal'
                  }`
                }
              >
                Court
              </NavLink>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `headline text-base md:text-lg transition ${
                    isActive ? 'text-signal' : 'text-ink-900 hover:text-signal'
                  }`
                }
              >
                Shop
              </NavLink>
              <span className="headline text-base md:text-lg text-ink-400">
                Weekly Pick
              </span>
            </div>
          </nav>
        </div>
      </div>

      {/* Disclosure bar */}
      <div className="border-t border-dashed border-ink-900/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <p className="typewriter text-ink-500 text-xs md:text-sm leading-relaxed">
                <Link to="/" className="text-ink-900 underline">
                  운동하는 사람들, 그냥 좋아서 하는 사람들.
                </Link>
              </p>
            </div>
            <div className="md:text-right">
              <span className="typewriter-label text-ink-500">
                ISSUE No.001 · SPRING 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
