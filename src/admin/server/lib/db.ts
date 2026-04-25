/**
 * better-sqlite3 싱글톤 — admin 프로세스 수명 동안 단일 연결.
 * data/admin/saintremy-editor.sqlite 가 없으면 startup에서 자동 마이그레이션.
 */
import Database, { type Database as DB } from 'better-sqlite3'
import { existsSync } from 'node:fs'
import { runMigrations, DB_PATH } from '../../../server/db/migrate.ts'

let _db: DB | null = null

export function getDb(): DB {
  if (_db) return _db
  if (!existsSync(DB_PATH)) {
    runMigrations({ silent: true })
  }
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  return _db
}

export function closeDb(): void {
  if (_db) {
    _db.close()
    _db = null
  }
}
