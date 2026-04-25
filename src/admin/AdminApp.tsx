import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { NewArticle } from './pages/NewArticle'
import { ArticleProgress } from './pages/ArticleProgress'

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/new" element={<NewArticle />} />
      <Route path="/articles/:id/progress" element={<ArticleProgress />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
