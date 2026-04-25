/**
 * .env.admin 로드 — admin 전용 시크릿(Vite/Cloudflare 의 .env.local 과 격리).
 * 호환을 위해 .env.local 도 fallback 으로 같이 로드(.env.admin 값이 override).
 * src/admin/server/index.ts 의 *최상단* import로 두어 다른 모듈보다 먼저 평가되어야 함.
 */
import dotenv from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(here, '../../..')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local'), override: false })
dotenv.config({ path: resolve(REPO_ROOT, '.env.admin'), override: true })
