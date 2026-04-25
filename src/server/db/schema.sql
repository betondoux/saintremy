-- Saint-Rémy Editor — local admin SQLite schema
-- 위치: data/admin/saintremy-editor.sqlite (gitignore)
-- 멱등 (CREATE IF NOT EXISTS) — migrate.ts가 실행 시마다 안전하게 적용.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── drafts ──────────────────────────────────────────────
-- 기사 드래프트 (Day 1: 폼에서 INSERT만, Day 2~ 단계별 채움)
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT NOT NULL,
  channels TEXT,
  price_range TEXT,
  custom_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  step_intake TEXT,
  step_trends TEXT,
  step_picks TEXT,
  step_body_md TEXT,
  step_compliance TEXT,
  step_seo TEXT,
  links TEXT,
  images TEXT,
  hero_image_url TEXT,
  instagram_cards TEXT,
  instagram_caption TEXT,
  instagram_schedule TEXT,
  instagram_post_url TEXT,
  instagram_status TEXT DEFAULT 'draft',
  published_url TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_category ON drafts(category);
CREATE INDEX IF NOT EXISTS idx_drafts_updated ON drafts(updated_at DESC);

-- ─── sessions ────────────────────────────────────────────
-- admin 로그인 세션 (쿠키 토큰 ↔ 만료시각)
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ─── login_attempts ──────────────────────────────────────
-- IP별 실패 횟수 (5회 이상 1시간 차단)
CREATE TABLE IF NOT EXISTS login_attempts (
  ip_address TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  blocked_until TIMESTAMP
);

-- ─── jobs ────────────────────────────────────────────────
-- Day 2~ 비동기 작업 큐 (에이전트 실행, 이미지 생성 등)
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id TEXT,
  type TEXT,
  payload TEXT,
  status TEXT DEFAULT 'pending',
  result TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  FOREIGN KEY (draft_id) REFERENCES drafts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_draft ON jobs(draft_id);
