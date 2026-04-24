-- Saint-Rémy Studio — D1 Schema
-- DB: saintremy-analytics
--
-- 적용 방법:
--   wrangler d1 execute saintremy-analytics --file=./workers/schema.sql
--   (또는 --remote 플래그로 프로덕션에 적용)

-- ─────────────────────────────────────────────────────────
-- 콘텐츠 스냅샷 (Notion 빌드 시 동기화)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS articles (
  slug          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  published     TEXT,
  author        TEXT,
  read_time     INTEGER,
  hero_image    TEXT,
  last_synced   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

CREATE TABLE IF NOT EXISTS products (
  id                    TEXT PRIMARY KEY,
  slug                  TEXT NOT NULL,
  name                  TEXT NOT NULL,
  brand                 TEXT,
  category              TEXT NOT NULL,
  price                 INTEGER,
  original_price        INTEGER,
  vendor                TEXT,
  related_article_slug  TEXT,
  -- 파트너별 실제 제휴 URL (JSON):
  -- { "coupang": "https://...", "naver": "https://...", "ohouse": "https://..." }
  affiliate_url         TEXT,
  last_synced           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_article  ON products(related_article_slug);

-- ─────────────────────────────────────────────────────────
-- 파트너 정의 (코드에서 seed)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS partners (
  id               TEXT PRIMARY KEY,      -- 'coupang' | 'naver' | 'ohouse' | 'oliveyoung' | 'musinsa' | 'aliexpress' | 'amazon' | 'linkprice'
  name             TEXT NOT NULL,
  commission_rate  REAL,                  -- 기본 수수료율 (%)
  cookie_days      REAL,                  -- 쿠키 유지 일수 (24시간=1.0)
  color            TEXT,                  -- UI 색상 hex
  base_domain      TEXT,                  -- 링크 검증용
  created_at       INTEGER NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- 클릭 이벤트 (핵심)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clicks (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ts             INTEGER NOT NULL,       -- unix ms
  session_id     TEXT    NOT NULL,
  article_slug   TEXT,
  product_id     TEXT,
  partner_id     TEXT    NOT NULL,
  target_url     TEXT    NOT NULL,
  referrer       TEXT,
  user_agent     TEXT,
  country        TEXT,                   -- CF-IPCountry
  device         TEXT,                   -- mobile | desktop | tablet | bot
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  ip_hash        TEXT                    -- salted SHA-256, dedup 용
);
CREATE INDEX IF NOT EXISTS idx_clicks_ts      ON clicks(ts);
CREATE INDEX IF NOT EXISTS idx_clicks_article ON clicks(article_slug, ts);
CREATE INDEX IF NOT EXISTS idx_clicks_partner ON clicks(partner_id, ts);
CREATE INDEX IF NOT EXISTS idx_clicks_product ON clicks(product_id, ts);
CREATE INDEX IF NOT EXISTS idx_clicks_session ON clicks(session_id);

-- ─────────────────────────────────────────────────────────
-- 페이지뷰 이벤트
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pageviews (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            INTEGER NOT NULL,
  session_id    TEXT    NOT NULL,
  path          TEXT    NOT NULL,
  article_slug  TEXT,
  category      TEXT,
  referrer      TEXT,
  user_agent    TEXT,
  country       TEXT,
  device        TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  dwell_ms      INTEGER,                 -- 체류시간 (beacon으로 업데이트)
  scroll_depth  INTEGER,                 -- 0-100 (%)
  ip_hash       TEXT
);
CREATE INDEX IF NOT EXISTS idx_pv_ts      ON pageviews(ts);
CREATE INDEX IF NOT EXISTS idx_pv_path    ON pageviews(path, ts);
CREATE INDEX IF NOT EXISTS idx_pv_article ON pageviews(article_slug, ts);
CREATE INDEX IF NOT EXISTS idx_pv_session ON pageviews(session_id);

-- ─────────────────────────────────────────────────────────
-- 세션 (UTM 퍼스트터치 저장용)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id               TEXT PRIMARY KEY,
  started_at       INTEGER NOT NULL,
  last_seen_at     INTEGER NOT NULL,
  country          TEXT,
  device           TEXT,
  referrer         TEXT,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  landing_path     TEXT,
  page_count       INTEGER DEFAULT 0,
  click_count      INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);

-- ─────────────────────────────────────────────────────────
-- 수익 이벤트 (API pull 또는 CSV 업로드)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id        TEXT    NOT NULL,
  partner_order_id  TEXT,                  -- 파트너사 주문 ID (중복 방지)
  click_id          INTEGER,               -- clicks.id 매칭
  article_slug      TEXT,
  product_id        TEXT,
  product_name      TEXT,
  amount            INTEGER,               -- 판매금액 (원)
  commission        INTEGER NOT NULL,      -- 수수료 수익 (원)
  currency          TEXT DEFAULT 'KRW',
  ts                INTEGER NOT NULL,      -- 구매 시점
  confirmed_at      INTEGER,               -- 확정 시점
  status            TEXT NOT NULL,         -- pending | confirmed | cancelled | refunded
  source            TEXT NOT NULL,         -- api | csv | manual
  raw_payload       TEXT                   -- JSON 원본
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_conv_unique ON conversions(partner_id, partner_order_id);
CREATE INDEX IF NOT EXISTS idx_conv_ts         ON conversions(ts);
CREATE INDEX IF NOT EXISTS idx_conv_partner    ON conversions(partner_id, ts);
CREATE INDEX IF NOT EXISTS idx_conv_article    ON conversions(article_slug, ts);
CREATE INDEX IF NOT EXISTS idx_conv_status     ON conversions(status);

-- ─────────────────────────────────────────────────────────
-- A/B 테스트 (Phase 4)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ab_tests (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  article_slug  TEXT,
  variant_a     TEXT,                     -- JSON
  variant_b     TEXT,                     -- JSON
  started_at    INTEGER NOT NULL,
  ended_at      INTEGER,
  status        TEXT NOT NULL             -- running | completed | paused
);

CREATE TABLE IF NOT EXISTS ab_assignments (
  session_id    TEXT NOT NULL,
  test_id       TEXT NOT NULL,
  variant       TEXT NOT NULL,            -- 'a' | 'b'
  assigned_at   INTEGER NOT NULL,
  PRIMARY KEY (session_id, test_id)
);

-- ─────────────────────────────────────────────────────────
-- 파트너 시드 데이터
-- ─────────────────────────────────────────────────────────

INSERT OR IGNORE INTO partners (id, name, commission_rate, cookie_days, color, base_domain, created_at) VALUES
  ('coupang',    '쿠팡 파트너스',       3.0,  1.0, '#E2231A', 'coupang.com',      strftime('%s','now')*1000),
  ('naver',      '네이버 쇼핑 커넥트',  5.0,  1.0, '#03C75A', 'smartstore.naver.com', strftime('%s','now')*1000),
  ('ohouse',     '오늘의집 큐레이터',   3.0,  1.0, '#35C5F0', 'ohou.se',          strftime('%s','now')*1000),
  ('oliveyoung', '올리브영 큐레이터',   7.0,  1.0, '#8BC34A', 'oliveyoung.co.kr', strftime('%s','now')*1000),
  ('musinsa',    '무신사 큐레이터',     10.0, 1.0, '#000000', 'musinsa.com',      strftime('%s','now')*1000),
  ('aliexpress', '알리익스프레스',       6.0,  3.0, '#FF4747', 'aliexpress.com',   strftime('%s','now')*1000),
  ('amazon',     '아마존 어소시에이트', 4.0,  1.0, '#FF9900', 'amazon.com',       strftime('%s','now')*1000),
  ('linkprice',  '링크프라이스 (네트워크)', 0.0, 1.0, '#6366F1', 'linkprice.com', strftime('%s','now')*1000);
