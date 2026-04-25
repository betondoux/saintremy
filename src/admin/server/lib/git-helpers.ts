/**
 * 안전한 git 헬퍼 — admin server 가 발행 시 사용.
 *
 * 정책:
 *   - cwd 는 항상 REPO_ROOT
 *   - 위험 명령 (reset --hard, push --force) 는 노출하지 않음
 *   - exec 결과는 trim 후 문자열 반환, 실패 시 throw
 *   - push 는 ADMIN_AUTO_PUSH=true 일 때 publisher 가 호출 (여기서는 직접 게이트하지 않음)
 */
import { execFileSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(__dirname, '../../../..')

type ExecOpts = { cwd?: string; timeoutMs?: number }

function git(args: string[], opts: ExecOpts = {}): string {
  const cwd = opts.cwd ?? REPO_ROOT
  const timeout = opts.timeoutMs ?? 30_000
  const out = execFileSync('git', args, {
    cwd,
    timeout,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return out.toString().trim()
}

export function gitStatusShort(): string {
  return git(['status', '--short'])
}

export function gitCurrentBranch(): string {
  return git(['rev-parse', '--abbrev-ref', 'HEAD'])
}

export function gitHeadCommit(): string {
  return git(['rev-parse', 'HEAD'])
}

export function gitAdd(paths: string[]): void {
  if (paths.length === 0) return
  git(['add', '--', ...paths])
}

export function gitCommit(message: string): string {
  // commit 메시지는 -m 으로 단일 인자 전달 (shell 거치지 않으므로 안전)
  git(['commit', '-m', message])
  return gitHeadCommit()
}

export function gitPush(branch?: string): void {
  const args = branch ? ['push', 'origin', branch] : ['push']
  git(args, { timeoutMs: 60_000 })
}

export function gitDiffCached(): string {
  return git(['diff', '--cached', '--stat'])
}

/**
 * 특정 파일이 git working tree 에서 추적/변경 상태인지 검사 — 발행 후 롤백 시 활용.
 */
export function gitCheckoutFile(path: string): void {
  git(['checkout', 'HEAD', '--', path])
}

/**
 * 새로 추가된 파일 (git add 안 한 상태) 을 working tree 에서 제거 — 롤백용.
 */
export function rmIfUntracked(path: string): boolean {
  try {
    const out = git(['ls-files', '--', path])
    if (out === '') {
      // 추적되지 않은 파일이면 fs.unlink (호출 측에서)
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}
