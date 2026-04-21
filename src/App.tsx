import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { NewsletterBottomBar } from './components/NewsletterBottomBar'
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

          {/* 6 sport categories */}
          <Route path="/lift" element={<CategoryPage />} />
          <Route path="/combat" element={<CategoryPage />} />
          <Route path="/football" element={<CategoryPage />} />
          <Route path="/run" element={<CategoryPage />} />
          <Route path="/flow" element={<CategoryPage />} />
          <Route path="/court" element={<CategoryPage />} />

          {/* Redirect legacy categories */}
          <Route path="/science" element={<Navigate to="/lift" replace />} />
          <Route path="/culture" element={<Navigate to="/combat" replace />} />
          <Route path="/films" element={<Navigate to="/run" replace />} />

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
      <NewsletterBottomBar />
      <CookieBanner />
    </div>
  )
}

export default App
