/**
 * Saint-Rémy Editor — SQLite 마이그레이션 러너
 *
 * 실행: npm run db:migrate (또는 admin server 부팅 시 자동 호출)
 * 위치: data/admin/saintremy-editor.sqlite (gitignore)
 *
 * schema.sql이 모두 CREATE IF NOT EXISTS 라서 반복 실행 안전.
 */
import Database from 'better-sqlite3'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const DB_PATH = resolve(__dirname, '../../../data/admin/saintremy-editor.sqlite')
const SCHEMA_PATH = resolve(__dirname, './schema.sql')

export function runMigrations(opts: { silent?: boolean } = {}): { db_path: string; tables: string[] } {
  const { silent = false } = opts
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const schema = readFileSync(SCHEMA_PATH, 'utf-8')
  const db = new Database(DB_PATH)
  try {
    db.exec(schema)
    runAdditiveColumnMigrations(db, silent)
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all()
      .map((r) => (r as { name: string }).name)
    if (!silent) {
      console.log(`[db:migrate] ✓ ${DB_PATH}`)
      console.log(`[db:migrate] tables: ${tables.join(', ')}`)
    }
    return { db_path: DB_PATH, tables }
  } finally {
    db.close()
  }
}

/**
 * 기존 DB 에 컬럼이 없는 경우만 ALTER TABLE 로 추가.
 * CREATE TABLE IF NOT EXISTS 는 이미 있는 테이블을 변경하지 않으므로 별도 처리.
 */
function runAdditiveColumnMigrations(db: Database.Database, silent: boolean): void {
  const additions: { table: string; column: string; ddl: string }[] = [
    { table: 'drafts', column: 'link_validation', ddl: 'ALTER TABLE drafts ADD COLUMN link_validation TEXT' },
    { table: 'drafts', column: 'publish_path', ddl: 'ALTER TABLE drafts ADD COLUMN publish_path TEXT' },
    { table: 'drafts', column: 'publish_commit', ddl: 'ALTER TABLE drafts ADD COLUMN publish_commit TEXT' },
  ]
  for (const a of additions) {
    const cols = db.prepare(`PRAGMA table_info(${a.table})`).all() as { name: string }[]
    if (cols.find((c) => c.name === a.column)) continue
    db.exec(a.ddl)
    if (!silent) console.log(`[db:migrate] + ${a.table}.${a.column}`)
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  runMigrations()
}
