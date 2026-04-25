/**
 * 에이전트 공통 인프라.
 *
 * - .claude/agents/<name>.md 의 YAML frontmatter 제거 후 system prompt 로드
 * - Mock 모드 / 부분 라이브 모드 / 비용 가드
 * - 응답 raw + JSON 파싱 시도 결과 반환
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { callClaudeWithRetry, DEFAULT_MODEL } from '../lib/anthropic-client.ts'
import {
  calculateCost,
  recordCost,
  assertCostBudget,
  type Usage,
} from '../lib/cost-tracker.ts'

export type AgentName =
  | 'saintremy-editor-in-chief'
  | 'trend-scout'
  | 'product-vetter'
  | 'copy-strategist'
  | 'affiliate-compliance-officer'
  | 'seo-architect'

export type AgentResult = {
  raw: string
  parsed: unknown
  cost: number
  usage: Usage
  mock: boolean
}

const AGENTS_DIR = path.resolve(process.cwd(), '.claude/agents')

const promptCache = new Map<string, string>()

const FALLBACK_PROMPTS: Record<AgentName, string> = {
  'saintremy-editor-in-chief':
    'You are the Editor-in-Chief of Saint-Rémy Editors. Run a 5-point check on the incoming brief and lock scope/tone/mix-slot. Return JSON: {approved, scope, tone, mix_slot, five_point: {...}}.',
  'trend-scout':
    'You are the Trend Scout for Saint-Rémy Editors. Surface 5–10 ranked editorial pitches with demand signals and product candidates. Return JSON: {trends: [...], products: [{name, brand, channel, why}]}.',
  'product-vetter':
    'You are the Product Vetter. Pass each candidate through the 6-gate (Existence, Function, Value, Innovation, Evidence, "Would I buy?"). Return JSON: {picks: [{name, brand, url, price_krw, pros: [...], drawback}], rejected: [...]}.',
  'copy-strategist':
    'You are the Copy Strategist. Write a Korean editorial in the Saint-Rémy first-person voice with structure: headline → lede → pick blocks (each with one honest drawback) → "How we picked" → closer. Output the body as Markdown.',
  'affiliate-compliance-officer':
    'You are the Affiliate Compliance Officer. Audit the body against Coupang Partners + 공정위 표시·광고 규정. Return JSON: {disclosure_text, compliance_passed: boolean, issues: [...], edited_body_md}.',
  'seo-architect':
    'You are the SEO Architect. Produce slug (≤60자 kebab-case), meta title (≤60자), meta description (≤155자), OG tags, 3 internal link suggestions, schema.org JSON-LD. Return JSON: {slug, meta_title, meta_description, og: {...}, internal_links: [...], json_ld: {...}}.',
}

export async function loadAgentPrompt(name: AgentName): Promise<string> {
  if (promptCache.has(name)) return promptCache.get(name)!
  const file = path.join(AGENTS_DIR, `${name}.md`)
  let prompt: string
  try {
    const content = await fs.readFile(file, 'utf-8')
    prompt = stripFrontmatter(content)
  } catch {
    console.warn(`[agents] ${name}.md not found, using fallback prompt.`)
    prompt = FALLBACK_PROMPTS[name]
  }
  promptCache.set(name, prompt)
  return prompt
}

function stripFrontmatter(text: string): string {
  // ---\n...\n---\n<body>
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)
  return m ? m[1].trim() : text.trim()
}

function isLive(name: AgentName): boolean {
  if (process.env.ADMIN_MOCK_AGENTS === 'true') return false
  const live = (process.env.ADMIN_AGENTS_LIVE ?? '').trim()
  if (live === '' || live === '*' || live === 'all') return true
  return live
    .split(',')
    .map((s) => s.trim())
    .includes(name)
}

export type RunOpts = {
  name: AgentName
  input: unknown
  draftId: string
  maxTokens?: number
  temperature?: number
}

export async function runAgent(opts: RunOpts): Promise<AgentResult> {
  if (!isLive(opts.name)) {
    return mockAgentResult(opts.name, opts.input)
  }

  // 비용 가드 — 호출 전 (지난 누적)
  assertCostBudget({
    draftId: opts.draftId,
    maxJob: Number(process.env.ADMIN_MAX_COST_PER_JOB),
    maxDay: Number(process.env.ADMIN_MAX_COST_PER_DAY),
  })

  const system = await loadAgentPrompt(opts.name)
  const user =
    typeof opts.input === 'string' ? opts.input : JSON.stringify(opts.input, null, 2)

  const response = await callClaudeWithRetry({
    system,
    user,
    maxTokens: opts.maxTokens ?? 8000,
    temperature: opts.temperature ?? 0.7,
  })

  const usage: Usage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cache_creation_input_tokens: response.usage.cache_creation_input_tokens,
    cache_read_input_tokens: response.usage.cache_read_input_tokens,
  }
  const cost = calculateCost(usage, response.model ?? DEFAULT_MODEL)
  recordCost(opts.draftId, opts.name, cost, usage, response.model ?? DEFAULT_MODEL)

  const raw = response.content
    .filter((c): c is { type: 'text'; text: string } & typeof c => c.type === 'text')
    .map((c) => c.text)
    .join('\n')

  const parsed = tryParseJSON(raw)

  return { raw, parsed, cost, usage, mock: false }
}

function tryParseJSON(raw: string): unknown {
  // 1) ```json ... ``` 블록
  const fenced = raw.match(/```(?:json)?\s*\n([\s\S]+?)\n```/)
  if (fenced) {
    try {
      return JSON.parse(fenced[1])
    } catch {
      /* fall through */
    }
  }
  // 2) 첫 { ... } 또는 [ ... ] 블록
  const trimmed = raw.trim()
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed)
    } catch {
      /* fall through */
    }
  }
  return null
}

// ─── Mock fixtures ──────────────────────────────────────
function mockAgentResult(name: AgentName, input: unknown): AgentResult {
  const mocks: Record<AgentName, unknown> = {
    'saintremy-editor-in-chief': {
      approved: true,
      scope: '한국 거주 30대, 첫 구매로 후회 없는 1~2개',
      tone: 'authoritative-but-warm',
      mix_slot: 'evergreen-best',
      five_point: {
        purchase_intent: 'high',
        function_value_innovation: 'function+value',
        voice_pov: '에디터가 6개월 직접 사용',
        category_fit: 'pass',
        content_mix: 'BEST-5 evergreen',
      },
    },
    'trend-scout': {
      trends: [
        { rank: 1, topic: 'Mock 트렌드 1', demand_signal: '검색량 급증', angle: '에디터 1개월 사용기' },
        { rank: 2, topic: 'Mock 트렌드 2', demand_signal: 'SNS 화제', angle: '가성비 vs 진짜' },
      ],
      products: [
        { name: 'Mock 제품 A', brand: 'BrandX', channel: 'coupang', why: '대표 SKU, 평점 4.6+' },
        { name: 'Mock 제품 B', brand: 'BrandY', channel: 'coupang', why: '신상, 검증 필요' },
        { name: 'Mock 제품 C', brand: 'BrandZ', channel: 'coupang', why: '베스트셀러' },
        { name: 'Mock 제품 D', brand: 'BrandW', channel: 'coupang', why: '에디터 픽 후보' },
        { name: 'Mock 제품 E', brand: 'BrandV', channel: 'coupang', why: '안티-픽 보완용' },
      ],
    },
    'product-vetter': {
      picks: [
        {
          rank: 1,
          name: 'Mock 제품 A',
          brand: 'BrandX',
          url: 'https://www.coupang.com/vp/products/000001',
          price_krw: 39000,
          pros: ['실측 OK', '평점 4.6', '국내 AS'],
          drawback: '색상이 사진보다 살짝 어둡다',
        },
        {
          rank: 2,
          name: 'Mock 제품 B',
          brand: 'BrandY',
          url: 'https://www.coupang.com/vp/products/000002',
          price_krw: 52000,
          pros: ['소재 좋음', '가성비'],
          drawback: '초기 냄새 1주일',
        },
      ],
      rejected: [
        { name: 'Mock 제품 D', reason: 'Evidence 부족 (리뷰 12개)' },
      ],
    },
    'copy-strategist':
      `# Mock 헤드라인 — 진짜 사면 좋은 5개\n\n` +
      `에디터 한 명이 6개월 동안 직접 써본 결과입니다. 결론부터: 1번이 압도적이었습니다.\n\n` +
      `## 1. Mock 제품 A\n사용한 첫날부터 차이가 났다. 단점도 정직하게 말하면, 색상이 사진보다 살짝 어둡다.\n\n` +
      `## 2. Mock 제품 B\n가성비 카테고리에서 의외의 발견. 다만 초기 냄새가 1주일.\n\n` +
      `## How we picked\n6-gate (Existence, Function, Value, Innovation, Evidence, "Would I buy") 통과 제품만 추렸습니다.\n\n` +
      `## 마무리\n광고가 아닙니다. 우리는 직접 사고, 직접 씁니다.`,
    'affiliate-compliance-officer': {
      disclosure_text:
        '본 글은 Coupang Partners 활동의 일환으로, 일정 수수료를 제공받습니다. 가격은 작성 시점 기준입니다.',
      compliance_passed: true,
      issues: [],
      edited_body_md: '<원문 그대로>',
    },
    'seo-architect': {
      slug: 'mock-best-5-evergreen',
      meta_title: 'Mock BEST 5 — 진짜 사면 좋은 것 | Saint-Rémy',
      meta_description:
        '에디터가 직접 써본 5개. 1번이 압도적, 단점까지 정직하게 적었습니다.',
      og: {
        title: 'Mock BEST 5',
        description: '에디터 6개월 사용기',
        image: '/images/og/mock-best-5.jpg',
      },
      internal_links: [
        { anchor: '관련 가이드 1', url: '/guide/related-1' },
        { anchor: '관련 BEST', url: '/best/related-2' },
        { anchor: '카테고리 홈', url: '/category/x' },
      ],
      json_ld: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Mock BEST 5',
      },
    },
  }
  const parsed = mocks[name]
  return {
    raw: typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2),
    parsed: typeof parsed === 'string' ? null : parsed,
    cost: 0,
    usage: { input_tokens: 0, output_tokens: 0 },
    mock: true,
    // input 은 mock 에서 사용 안 하지만, 디버그용으로 회수 가능
    ...{ _input: input },
  } as AgentResult
}
