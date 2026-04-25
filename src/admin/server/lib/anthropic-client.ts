/**
 * Anthropic SDK 클라이언트 + 재시도 래퍼.
 *
 * - 모델: claude-sonnet-4-5 (Saint-Rémy 본문/검증/SEO 기본)
 * - 429/500/503 → 지수 백오프 재시도 (1s → 2s → 4s)
 * - 4xx (auth/invalid_request 등) → 즉시 throw (재시도 무의미)
 */
import Anthropic from '@anthropic-ai/sdk'
import type { Message, MessageParam, Tool } from '@anthropic-ai/sdk/resources/messages.js'

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY 미설정. .env.admin 에 sk-ant-* 키를 설정하거나 ADMIN_MOCK_AGENTS=true 로 실행하세요.'
    )
  }
  _client = new Anthropic({ apiKey })
  return _client
}

export const DEFAULT_MODEL = 'claude-sonnet-4-5'

export type CallOpts = {
  system: string
  user: string | MessageParam[]
  maxTokens?: number
  tools?: Tool[]
  temperature?: number
  model?: string
}

export async function callClaude(opts: CallOpts): Promise<Message> {
  const messages: MessageParam[] = Array.isArray(opts.user)
    ? opts.user
    : [{ role: 'user', content: opts.user }]

  return getClient().messages.create({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 8000,
    system: opts.system,
    messages,
    tools: opts.tools,
    temperature: opts.temperature ?? 0.7,
  })
}

function isRetryable(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  // Anthropic SDK throws APIError with .status
  const status = (err as { status?: number }).status
  if (status === 429) return true
  if (status === 500 || status === 502 || status === 503 || status === 504) return true
  // network-level errors
  const code = (err as { code?: string }).code
  if (code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') return true
  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function callClaudeWithRetry(
  opts: CallOpts,
  maxRetries = 3
): Promise<Message> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callClaude(opts)
    } catch (err) {
      lastErr = err
      if (attempt === maxRetries || !isRetryable(err)) {
        throw err
      }
      const backoff = 1000 * Math.pow(2, attempt) // 1s, 2s, 4s
      console.warn(
        `[anthropic] retryable error (attempt ${attempt + 1}/${maxRetries + 1}), backoff ${backoff}ms:`,
        (err as Error).message
      )
      await sleep(backoff)
    }
  }
  throw lastErr ?? new Error('callClaudeWithRetry: unknown failure')
}

/**
 * 헬스체크용 초저비용 ping. 토큰 ~10개 사용 (~$0.0001).
 * 실패 시 throw — 호출측에서 catch.
 */
export async function pingClaude(): Promise<{ ok: true; model: string }> {
  const res = await callClaude({
    system: 'reply with the single word OK',
    user: 'ping',
    maxTokens: 8,
    temperature: 0,
  })
  return { ok: true, model: res.model }
}
