import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { CookieBanner } from './components/CookieBanner'
import { Home } from './pages/Home'
import { CategoryPage } from './pages/CategoryPage'
import { ArticlePage } from './pages/ArticlePage'
import { ShopPage } from './pages/ShopPage'
import { SearchPage } from './pages/SearchPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { AboutPage } from './pages/AboutPage'
import { NotFound } from './pages/NotFound'
import { useAnalytics } from './lib/analytics'

function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function AnalyticsBridge() {
  useAnalytics()
  return null
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <ScrollToTop />
      <AnalyticsBridge />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* ═══════════════════════════════════════════════════
              11개 카테고리 (Saint-Rémy 2026)
              ═══════════════════════════════════════════════════ */}
          <Route path="/gift" element={<Navigate to="/deals" replace />} />
          <Route path="/deal" element={<Navigate to="/deals" replace />} />
          <Route path="/style" element={<CategoryPage />} />
          <Route path="/home" element={<CategoryPage />} />
          <Route path="/deals" element={<CategoryPage />} />
          <Route path="/beauty" element={<Navigate to="/style" replace />} />
          <Route path="/space" element={<CategoryPage />} />
          <Route path="/kitchen" element={<Navigate to="/home" replace />} />
          <Route path="/move" element={<Navigate to="/space" replace />} />
          <Route path="/travel" element={<CategoryPage />} />
          <Route path="/furniture" element={<Navigate to="/home" replace />} />
          <Route path="/living" element={<Navigate to="/home" replace />} />
          <Route path="/music" element={<CategoryPage />} />
          <Route path="/story" element={<CategoryPage />} />

          {/* ═══════════════════════════════════════════════════
              레거시 6개 스포츠 카테고리 → /move로 리다이렉트
              (기존 SEO 링크 보호)
              ═══════════════════════════════════════════════════ */}
          {/* 이중 리다이렉트(/lift → /move → /space) 단축 — Google이 chain 안 따라감 */}
          <Route path="/lift" element={<Navigate to="/space" replace />} />
          <Route path="/combat" element={<Navigate to="/space" replace />} />
          <Route path="/football" element={<Navigate to="/space" replace />} />
          <Route path="/run" element={<Navigate to="/space" replace />} />
          <Route path="/flow" element={<Navigate to="/space" replace />} />
          <Route path="/court" element={<Navigate to="/space" replace />} />

          {/* 구 legacy 리다이렉트 — 과거 블로그 링크 보호 (직접 /space 로 단축) */}
          <Route path="/science" element={<Navigate to="/space" replace />} />
          <Route path="/culture" element={<Navigate to="/space" replace />} />
          <Route path="/films" element={<Navigate to="/space" replace />} />

          {/* Shop */}
          <Route path="/shop" element={<ShopPage />} />

          {/* Search (placeholder) */}
          <Route path="/search" element={<SearchPage />} />

          {/* Legal & Info pages */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Article detail */}
          <Route path="/a/:slug" element={<ArticlePage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}

export default App