/**
 * /admin SPA 진입점.
 *
 * Editor (Day 1~3) + Studio (분석 대시보드) 통합.
 * /login 외 모든 라우트는 좌측 사이드바 + 240px 메인 레이아웃.
 */
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { NewArticle } from './pages/NewArticle'
import { ArticleProgress } from './pages/ArticleProgress'
import { ArticlePreview } from './pages/ArticlePreview'
// Studio 통합 (대시보드)
import { Overview } from './pages/Overview'
import { Realtime } from './pages/Realtime'
import { Articles } from './pages/Articles'
import { Products } from './pages/Products'
import { Partners } from './pages/Partners'
import { Funnel } from './pages/Funnel'
import { Traffic } from './pages/Traffic'
import { ABTests } from './pages/ABTests'
import { ContentHealth } from './pages/ContentHealth'
import { Settings } from './pages/Settings'

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div style={{ padding: '32px 40px 64px', maxWidth: 1400, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminApp() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  // 로그인 페이지: 사이드바 없음 (전체 화면 카드)
  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // 로그인 후 모든 페이지: 사이드바 + 메인
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />

        {/* Editor */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewArticle />} />
        <Route path="/articles/:id/progress" element={<ArticleProgress />} />
        <Route path="/articles/:id/preview" element={<ArticlePreview />} />

        {/* Studio (대시보드) */}
        <Route path="/overview" element={<Overview />} />
        <Route path="/realtime" element={<Realtime />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/products" element={<Products />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/funnel" element={<Funnel />} />
        <Route path="/traffic" element={<Traffic />} />
        <Route path="/ab-tests" element={<ABTests />} />
        <Route path="/content-health" element={<ContentHealth />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </MainLayout>
  )
}
