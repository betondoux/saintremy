import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { CookieBanner } from './components/CookieBanner'
import { Home } from './pages/Home'
import { CategoryPage } from './pages/CategoryPage'
import { ArticlePage } from './pages/ArticlePage'
import { ShopPage } from './pages/ShopPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { AboutPage } from './pages/AboutPage'
import { NotFound } from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* ═══════════════════════════════════════════════════
              10개 카테고리 (AMATOR 2026)
              ═══════════════════════════════════════════════════ */}
          <Route path="/gift" element={<CategoryPage />} />
          <Route path="/deal" element={<CategoryPage />} />
          <Route path="/style" element={<CategoryPage />} />
          <Route path="/beauty" element={<CategoryPage />} />
          <Route path="/space" element={<CategoryPage />} />
          <Route path="/kitchen" element={<CategoryPage />} />
          <Route path="/move" element={<CategoryPage />} />
          <Route path="/travel" element={<CategoryPage />} />
          <Route path="/furniture" element={<CategoryPage />} />
          <Route path="/living" element={<CategoryPage />} />

          {/* ═══════════════════════════════════════════════════
              레거시 6개 스포츠 카테고리 → /move로 리다이렉트
              (기존 SEO 링크 보호)
              ═══════════════════════════════════════════════════ */}
          <Route path="/lift" element={<Navigate to="/move" replace />} />
          <Route path="/combat" element={<Navigate to="/move" replace />} />
          <Route path="/football" element={<Navigate to="/move" replace />} />
          <Route path="/run" element={<Navigate to="/move" replace />} />
          <Route path="/flow" element={<Navigate to="/move" replace />} />
          <Route path="/court" element={<Navigate to="/move" replace />} />

          {/* 구 legacy 리다이렉트 — 과거 블로그 링크 보호 */}
          <Route path="/science" element={<Navigate to="/move" replace />} />
          <Route path="/culture" element={<Navigate to="/move" replace />} />
          <Route path="/films" element={<Navigate to="/move" replace />} />

          {/* Shop */}
          <Route path="/shop" element={<ShopPage />} />

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