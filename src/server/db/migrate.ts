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

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  runMigrations()
}
