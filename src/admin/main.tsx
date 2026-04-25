import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AdminApp from './AdminApp'
import './styles/admin.css'

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <BrowserRouter basename="/admin">
      <AdminApp />
    </BrowserRouter>
  </StrictMode>
)
