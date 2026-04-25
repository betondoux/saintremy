#!/usr/bin/env node
/**
 * Saint-Rémy Editor — admin 초기 설정.
 *
 * 실행: npm run admin:setup  (또는 node scripts/admin-setup.mjs)
 *
 * 작업:
 *   1. 비밀번호 prompt (echo 숨김)
 *   2. bcrypt(10) 해시 생성 → .env.admin 의 ADMIN_PASSWORD_HASH 갱신/삽입
 *   3. SESSION_SECRET 없으면 crypto.randomBytes(32) 자동 생성
 *   4. ADMIN_PORT/ADMIN_HOST 기본값 시드 (없을 때만)
 *   5. ANTHROPIC_API_KEY 미설정이면 안내
 *
 * .env.admin 은 .gitignore 됨. Vite/Cloudflare Pages 의 .env/.env.local 과 격리.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import readline from 'node:readline'
import bcrypt from 'bcrypt'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const ENV_PATH = resolve(REPO_ROOT, '.env.admin')

// 컨트롤 문자 (런타임 생성 — 소스에 raw 컨트롤 문자 넣지 않음)
const CTRL_C = String.fromCharCode(0x03)
const BACKSPACE_DEL = String.fromCharCode(0x7f)
const BACKSPACE_BS = String.fromCharCode(0x08)

// TTY가 아닐 때(테스트/CI/파이프) 사용할 line iterator.
// readline이 한 chunk에 다중 라인을 emit할 수 있으므로 버퍼 큐로 보관.
let _nonTtyRl = null
const _nonTtyLineBuf = []
const _nonTtyWaiters = []
let _nonTtyClosed = false
function getNonTtyReadline() {
  if (_nonTtyRl) return _nonTtyRl
  _nonTtyRl = readline.createInterface({ input: process.stdin, terminal: false })
  _nonTtyRl.on('line', (line) => {
    if (_nonTtyWaiters.length > 0) {
      _nonTtyWaiters.shift()(line)
    } else {
      _nonTtyLineBuf.push(line)
    }
  })
  _nonTtyRl.on('close', () => {
    _nonTtyClosed = true
    while (_nonTtyWaiters.length > 0) _nonTtyWaiters.shift()('')
  })
  return _nonTtyRl
}
function readNonTtyLine() {
  getNonTtyReadline()
  return new Promise((resolveOuter) => {
    if (_nonTtyLineBuf.length > 0) return resolveOuter(_nonTtyLineBuf.shift())
    if (_nonTtyClosed) return resolveOuter('')
    _nonTtyWaiters.push(resolveOuter)
  })
}

function promptPassword(query) {
  return new Promise((resolveOuter) => {
    process.stdout.write(query)

    if (!process.stdin.isTTY) {
      readNonTtyLine().then((line) => {
        // 비대화 모드: 입력 그대로 사용
        resolveOuter(line)
      })
      return
    }

    process.stdin.setRawMode(true)
    process.stdin.resume()

    let pwd = ''
    const onData = (key) => {
      const k = key.toString('utf-8')
      if (k === CTRL_C) {
        process.stdout.write('\n')
        process.exit(130)
      }
      if (k === '\r' || k === '\n') {
        cleanup()
        process.stdout.write('\n')
        resolveOuter(pwd)
        return
      }
      if (k === BACKSPACE_DEL || k === BACKSPACE_BS) {
        if (pwd.length > 0) {
          pwd = pwd.slice(0, -1)
          process.stdout.write('\b \b')
        }
        return
      }
      // ESC로 시작하는 chunk는 통째로 무시 — 화살표/Function 키 시퀀스(예: ESC[A)가
      // tail 문자만 남아 비밀번호에 새는 것을 막는다.
      if (k.charCodeAt(0) === 0x1b) return
      // 가시 문자만(스페이스 포함). 단일 제어 문자도 무시.
      for (const ch of k) {
        const code = ch.charCodeAt(0)
        if (code >= 0x20 && code !== 0x7f) {
          pwd += ch
          process.stdout.write('*')
        }
      }
    }
    function cleanup() {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.removeListener('data', onData)
    }
    process.stdin.on('data', onData)
  })
}

function parseEnv(content) {
  const lines = content.split(/\r?\n/)
  const map = new Map()
  lines.forEach((line, i) => {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
    if (m) map.set(m[1], { lineIdx: i, value: m[2] })
  })
  return { lines, map }
}

function setEnv(parsed, key, value) {
  const needsQuote =
    value.includes(' ') || value.includes('#') || value.includes('"')
  const v = needsQuote ? `"${value.replace(/"/g, '\\"')}"` : value
  const existing = parsed.map.get(key)
  if (existing) {
    parsed.lines[existing.lineIdx] = `${key}=${v}`
    existing.value = v
  } else {
    let insertAt = parsed.lines.length
    if (insertAt > 0 && parsed.lines[insertAt - 1] === '') insertAt -= 1
    parsed.lines.splice(insertAt, 0, `${key}=${v}`)
    parsed.map.set(key, { lineIdx: insertAt, value: v })
  }
}

function serializeEnv(parsed) {
  let content = parsed.lines.join('\n')
  if (!content.endsWith('\n')) content += '\n'
  return content
}

async function main() {
  console.log('\n  Saint-Rémy Editor — 초기 설정')
  console.log('  ────────────────────────────────\n')

  const pwd1 = await promptPassword('  새 admin 비밀번호: ')
  if (pwd1.length < 8) {
    console.error('\n  ✗ 비밀번호는 8자 이상이어야 합니다.')
    process.exit(1)
  }
  const pwd2 = await promptPassword('  비밀번호 확인:      ')
  if (pwd1 !== pwd2) {
    console.error('\n  ✗ 비밀번호가 일치하지 않습니다.')
    process.exit(1)
  }

  console.log('\n  bcrypt 해시 생성 중…')
  const hash = await bcrypt.hash(pwd1, 10)

  const existing = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : ''
  const parsed = parseEnv(existing)

  setEnv(parsed, 'ADMIN_PASSWORD_HASH', hash)

  let sessionSecretCreated = false
  const existingSecret = parsed.map.get('SESSION_SECRET')
  if (!existingSecret || !existingSecret.value || existingSecret.value === '""') {
    setEnv(parsed, 'SESSION_SECRET', randomBytes(32).toString('hex'))
    sessionSecretCreated = true
  }

  if (!parsed.map.has('ANTHROPIC_API_KEY')) setEnv(parsed, 'ANTHROPIC_API_KEY', '')
  if (!parsed.map.has('ADMIN_IP_WHITELIST')) setEnv(parsed, 'ADMIN_IP_WHITELIST', '')
  if (!parsed.map.has('ADMIN_PORT')) setEnv(parsed, 'ADMIN_PORT', '4321')
  if (!parsed.map.has('ADMIN_HOST')) setEnv(parsed, 'ADMIN_HOST', '127.0.0.1')

  writeFileSync(ENV_PATH, serializeEnv(parsed), { encoding: 'utf-8', mode: 0o600 })

  console.log(`  ✓ ADMIN_PASSWORD_HASH 갱신: ${ENV_PATH}`)
  if (sessionSecretCreated) console.log('  ✓ SESSION_SECRET 자동 생성 (64-hex)')

  const apiKey = parsed.map.get('ANTHROPIC_API_KEY')?.value ?? ''
  if (!apiKey || apiKey === '""') {
    console.log('\n  ⚠ ANTHROPIC_API_KEY 가 비어 있습니다.')
    console.log('     Day 2~ 에이전트 기능을 쓰려면 .env.admin 에 직접 입력하세요:')
    console.log('     ANTHROPIC_API_KEY=sk-ant-...\n')
  }

  const port = parsed.map.get('ADMIN_PORT')?.value ?? '4321'
  console.log('  ────────────────────────────────')
  console.log('  다음 단계:')
  console.log('    1) npm run db:migrate    # admin server가 자동 호출, 단독 실행도 OK')
  console.log('    2) npm run admin')
  console.log(`    3) http://localhost:${port}/admin/login\n`)

  if (_nonTtyRl) _nonTtyRl.close()
}

main().catch((e) => {
  console.error('\n  ✗ 실패:', e.message)
  process.exit(1)
})
