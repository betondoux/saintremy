import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { CookieBanner } from './components/CookieBanner'
import { Home } from './pages/Home'
import { CategoryPage } from './pages/CategoryPage'
import { ArticlePage } from './pages/ArticlePage'
import { ShopPage, ShopCategoryPage } from './pages/ShopPage'
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
              저속노화 매거진 — 5트랙 + STORIES + ARCHIVE (2026-05-26 피벗 후)
              ═══════════════════════════════════════════════════ */}
          <Route path="/move"    element={<CategoryPage />} />
          <Route path="/eat"     element={<CategoryPage />} />
          <Route path="/sleep"   element={<CategoryPage />} />
          <Route path="/mind"    element={<CategoryPage />} />
          <Route path="/track"   element={<CategoryPage />} />
          <Route path="/stories" element={<CategoryPage />} />
          <Route path="/archive" element={<CategoryPage />} />

          {/* ═══════════════════════════════════════════════════
              옛 카테고리 → 새 카테고리 redirect (SEO 보호)
              ═══════════════════════════════════════════════════ */}
          <Route path="/story"     element={<Navigate to="/stories" replace />} />
          <Route path="/music"     element={<Navigate to="/stories" replace />} />
          <Route path="/style"     element={<Navigate to="/archive" replace />} />
          <Route path="/home"      element={<Navigate to="/archive" replace />} />
          <Route path="/deals"     element={<Navigate to="/archive" replace />} />
          <Route path="/travel"    element={<Navigate to="/archive" replace />} />
          <Route path="/space"     element={<Navigate to="/archive" replace />} />
          <Route path="/beauty"    element={<Navigate to="/archive" replace />} />
          <Route path="/kitchen"   element={<Navigate to="/archive" replace />} />
          <Route path="/furniture" element={<Navigate to="/archive" replace />} />
          <Route path="/living"    element={<Navigate to="/archive" replace />} />
          <Route path="/gift"      element={<Navigate to="/archive" replace />} />
          <Route path="/deal"      element={<Navigate to="/archive" replace />} />

          {/* 옛 스포츠 → /move 직접 (이중 redirect 단축) */}
          <Route path="/lift"     element={<Navigate to="/move" replace />} />
          <Route path="/combat"   element={<Navigate to="/move" replace />} />
          <Route path="/football" element={<Navigate to="/move" replace />} />
          <Route path="/run"      element={<Navigate to="/move" replace />} />
          <Route path="/flow"     element={<Navigate to="/move" replace />} />
          <Route path="/court"    element={<Navigate to="/move" replace />} />

          {/* 옛 legacy → /stories (인물·문화) */}
          <Route path="/science" element={<Navigate to="/stories" replace />} />
          <Route path="/culture" element={<Navigate to="/stories" replace />} />
          <Route path="/films"   element={<Navigate to="/stories" replace />} />

          {/* SHOP — 저속노화 5트랙 상품 큐레이션 */}
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:track" element={<ShopCategoryPage />} />

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