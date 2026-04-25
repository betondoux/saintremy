/**
 * Saint-Rémy Editor — Express + Vite (middleware mode) 진입점.
 *
 * 옵션 A.1: 별도 프로세스, 포트 5174, localhost-only.
 * 메인 saintremy.kr SPA(vite.config.ts, 포트 5173)와 완전 분리.
 *
 * 흐름:
 *   1. dotenv로 .env.local 로드
 *   2. DB 자동 마이그레이션 (멱등)
 *   3. /api/admin/* → 라우터 (auth는 공개, dashboard/articles는 requireAdmin)
 *   4. Vite createServer({ middlewareMode, root: src/admin, base: /admin/ })
 *   5. /admin/* SPA fallback → vite.transformIndexHtml(src/admin/index.html)
 *   6. / → /admin/login redirect
 */
import 'dotenv/config'
import { createServer as createViteServer } from 'vite'
import express, { type Request, type Response, type NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

import { runMigrations } from '../../server/db/migrate.ts'
import { authRouter } from './routes/auth.ts'
import { dashboardRouter } from './routes/dashboard.ts'
import { articlesRouter } from './routes/articles.ts'
import { healthRouter } from './routes/health.ts'
import { requireAdmin } from './lib/middleware.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ADMIN_ROOT = resolve(__dirname, '..') // src/admin
const REPO_ROOT = resolve(__dirname, '../../..')

const PORT = Number(process.env.ADMIN_PORT ?? 5174)
const HOST = process.env.ADMIN_HOST ?? '127.0.0.1' // localhost-only by default

async function start() {
  // 1. DB 마이그레이션 (멱등)
  runMigrations({ silent: true })

  const app = express()

  // ─── 보안/파싱 ──────────────────────────────────
  app.set('trust proxy', 'loopback')
  app.use(
    helmet({
      // Vite HMR은 ws:// + inline script + import map 등 사용 → dev에서 CSP 비활성.
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-origin' },
    })
  )
  app.use(cookieParser())
  app.use(express.json({ limit: '512kb' }))

  // ─── 로그인 rate-limit (IP 차단과 별개의 1차 방어) ──
  const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1분
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use('/api/admin/auth/login', loginLimiter)

  // ─── API 라우터 ────────────────────────────────
  app.use('/api/admin/health', healthRouter)
  app.use('/api/admin/auth', authRouter)
  app.use('/api/admin/dashboard', requireAdmin({ mode: 'api' }), dashboardRouter)
  app.use('/api/admin/articles', requireAdmin({ mode: 'api' }), articlesRouter)

  // ─── Vite middleware mode (admin SPA 서빙) ─────
  const vite = await createViteServer({
    configFile: false,
    root: ADMIN_ROOT,
    base: '/admin/',
    cacheDir: resolve(REPO_ROOT, 'node_modules/.vite-admin'),
    appType: 'custom',
    server: {
      middlewareMode: true,
      hmr: { port: PORT + 1 },
    },
    plugins: [react()],
    resolve: {
      alias: {
        // src/admin → root이므로 일반적인 import는 그대로 동작
      },
    },
  })

  app.use(vite.middlewares)

  // ─── SPA fallback: /admin → index.html 변환 ────
  app.get('/admin', (_req, res) => res.redirect(302, '/admin/login'))
  app.get('/admin/*', async (req, res, next) => {
    try {
      const url = req.originalUrl
      const indexPath = resolve(ADMIN_ROOT, 'index.html')
      let html = readFileSync(indexPath, 'utf-8')
      html = await vite.transformIndexHtml(url, html)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e as Error)
      next(e)
    }
  })

  // ─── 루트 ──────────────────────────────────────
  app.get('/', (_req, res) => res.redirect(302, '/admin/login'))

  // ─── 에러 핸들러 ──────────────────────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[admin] unhandled error:', err)
    res.status(500).json({ error: 'internal_error', message: err.message })
  })

  app.listen(PORT, HOST, () => {
    console.log(`\n  Saint-Rémy Editor (admin)`)
    console.log(`  ────────────────────────────────`)
    console.log(`  → http://${HOST}:${PORT}/admin/login`)
    if (!process.env.ADMIN_PASSWORD_HASH) {
      console.log(
        `  ⚠ ADMIN_PASSWORD_HASH 미설정 — \`npm run admin:setup\` 으로 비밀번호를 먼저 설정하세요.`
      )
    }
    if (!process.env.SESSION_SECRET) {
      console.log(
        `  ⚠ SESSION_SECRET 미설정 — \`npm run admin:setup\` 이 자동 생성합니다.`
      )
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log(`  ⚠ ANTHROPIC_API_KEY 미설정 — Day 2~ 에이전트 사용 시 필요.`)
    }
    console.log()
  })
}

start().catch((e) => {
  console.error('[admin] startup failed:', e)
  process.exit(1)
})
