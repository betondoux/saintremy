/**
 * Saint-Rémy Editor — Publisher.
 *
 * 발행 흐름:
 *   1. drafts.status === 'ready' 검증
 *   2. 어필리에이트 링크 재검증 (실패 시 차단)
 *   3. SEO 단계 산출 slug 정규화 + 중복 방지
 *   4. frontmatter (build-content.ts 가 요구하는 필드) + body markdown 합쳐서
 *      content/articles/<category>/<slug>.md 작성
 *   5. npm run build:content 실행 → src/generated/articles.json 갱신 → 빌드 파이프라인 검증
 *      (실패 시 .md 파일 롤백 + DB status 유지)
 *   6. git add 두 파일 + commit (auto-push 는 옵션)
 *   7. drafts UPDATE: status='published', publish_path/publish_commit/published_url/published_at
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import type { Database as DB } from 'better-sqlite3'
import { REPO_ROOT, gitAdd, gitCommit, gitCurrentBranch, gitHeadCommit, gitPush } from './git-helpers.ts'
import { extractUrls, validateAllLinks, type LinkValidationSummary } from './link-validator.ts'

export type PublishResult = {
  success: boolean
  filePath?: string
  liveUrl?: string
  commit?: string
  pushed?: boolean
  branch?: string
  validation?: LinkValidationSummary
  error?: string
}

type DraftRow = {
  id: string
  topic: string
  category: string
  format: string
  status: string
  step_picks: string | null
  step_body_md: string | null
  step_seo: string | null
  step_compliance: string | null
  link_validation: string | null
  publish_path: string | null
}

const ARTICLES_DIR = path.resolve(REPO_ROOT, 'content/articles')
const ARTICLES_JSON = path.resolve(REPO_ROOT, 'src/generated/articles.json')
const SITE_BASE_URL = process.env.SITE_BASE_URL ?? 'https://saintremy.kr'

function parseJSON<T>(s: string | null): T | null {
  if (!s) return null
  try {
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

// product-vetter parsed payload 가 { products: [...] } / { picks: [...] } / raw [] 형태로
// 들쭉날쭉이라 항상 배열로 정규화한다. (articles-preview.ts 와 동일 로직)
function normalizePicks(s: string | null): Record<string, unknown>[] {
  const parsed = parseJSON<unknown>(s)
  const arr: unknown = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object'
      ? ((parsed as Record<string, unknown>).products ??
        (parsed as Record<string, unknown>).picks ??
        [])
      : []
  if (!Array.isArray(arr)) return []
  return arr.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
}

/**
 * 한국어/영문 혼합 텍스트를 안전한 kebab-case 슬러그로 변환.
 * - 영문/숫자/하이픈은 유지
 * - 공백→하이픈
 * - 그 외 (한글 포함) → 제거
 * - 결과가 비면 'article-<short-id>' 로 fallback
 */
export function slugify(input: string, fallbackSeed?: string): string {
  const s = input
    .toLowerCase()
    .replace(/[‐-―]/g, '-')
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  if (s.length >= 3) return s
  const seed = (fallbackSeed ?? '').replace(/-/g, '').slice(0, 6) || 'a'
  return `article-${seed}`
}

async function uniqueSlug(category: string, baseSlug: string): Promise<string> {
  const dir = path.join(ARTICLES_DIR, category)
  let exists = false
  try {
    await fs.access(path.join(dir, `${baseSlug}.md`))
    exists = true
  } catch {
    /* not found — slug free */
  }
  if (!exists) return baseSlug
  for (let i = 2; i < 50; i++) {
    const candidate = `${baseSlug}-${i}`.slice(0, 60)
    try {
      await fs.access(path.join(dir, `${candidate}.md`))
    } catch {
      return candidate
    }
  }
  // 50번 충돌 — timestamp 사용
  return `${baseSlug}-${Date.now().toString(36)}`.slice(0, 60)
}

/**
 * frontmatter YAML — build-content.ts 가 require 하는 최소 필드 (slug/category/title) +
 * 라이브 사이트 컴포넌트가 활용하는 dek/published/author/heroImage/affiliateDisclosure 등.
 *
 * 단순 직접 포맷: 값에 콜론이나 줄바꿈이 들어갈 수 있으므로 항상 JSON.stringify 로 quote.
 */
type Meta = {
  slug: string
  category: string
  title: string
  dek?: string
  description?: string
  published: string
  updated?: string
  author: string
  heroImage?: string
  thumbnailColor?: string
  categoryLabel?: string
  affiliateDisclosure: string
  picks?: Array<Record<string, unknown>>
  draftId: string
  publishedAt: string
}

const DEFAULT_DISCLOSURE =
  '이 기사에는 Saint-Rémy Editors의 어필리에이트 링크가 포함되어 있습니다. 독자의 구매가 발생할 경우 일정 수수료를 제공받으나, 제품 선정은 독립적으로 이루어집니다.'

function yamlString(v: unknown): string {
  if (v === undefined || v === null) return '""'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return JSON.stringify(String(v))
}

function buildFrontmatter(m: Meta): string {
  const lines: string[] = ['---']
  lines.push(`slug: ${m.slug}`)
  lines.push(`category: ${m.category}`)
  lines.push(`title: ${yamlString(m.title)}`)
  if (m.dek) lines.push(`dek: ${yamlString(m.dek)}`)
  if (m.description) lines.push(`description: ${yamlString(m.description)}`)
  lines.push(`published: '${m.published.slice(0, 10)}'`)
  if (m.updated) lines.push(`updated: '${m.updated.slice(0, 10)}'`)
  lines.push(`author: ${yamlString(m.author)}`)
  if (m.heroImage) lines.push(`heroImage: ${m.heroImage}`)
  if (m.thumbnailColor) lines.push(`thumbnailColor: '${m.thumbnailColor}'`)
  if (m.categoryLabel) lines.push(`categoryLabel: ${yamlString(m.categoryLabel)}`)
  lines.push(`affiliateDisclosure: >-`)
  lines.push(`  ${m.affiliateDisclosure.replace(/\n/g, '\n  ')}`)

  if (m.picks && m.picks.length > 0) {
    lines.push('picks:')
    m.picks.forEach((p, i) => {
      lines.push(`  - rank: ${i + 1}`)
      const name = (p.name as string) ?? `픽 ${i + 1}`
      lines.push(`    name: ${yamlString(name)}`)
      const url = (p.productUrl ?? p.product_url ?? p.url) as string | undefined
      if (url) lines.push(`    productUrl: ${url}`)
      const price = p.price ?? p.salePrice ?? p.price_krw
      if (price !== undefined && price !== null) lines.push(`    price: ${yamlString(price)}`)
      const drawback = (p.drawback ?? p.cons) as unknown
      if (typeof drawback === 'string' && drawback.length > 0) {
        lines.push(`    drawback: ${yamlString(drawback)}`)
      }
    })
  }

  lines.push(`source: saintremy-editor`)
  lines.push(`draftId: ${m.draftId}`)
  lines.push(`publishedAt: '${m.publishedAt}'`)
  lines.push('---')
  return lines.join('\n')
}

function pickSlugFromSeo(seo: unknown): string | null {
  if (!seo || typeof seo !== 'object') return null
  const o = seo as Record<string, unknown>
  const v = (o.slug ?? o.url_slug ?? o.path_slug) as unknown
  if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  return null
}

function pickTitleFromSeo(seo: unknown, fallback: string): string {
  if (!seo || typeof seo !== 'object') return fallback
  const o = seo as Record<string, unknown>
  const v = (o.title ?? o.meta_title ?? o.metaTitle) as unknown
  if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  return fallback
}

function pickDescFromSeo(seo: unknown): string | undefined {
  if (!seo || typeof seo !== 'object') return undefined
  const o = seo as Record<string, unknown>
  const v = (o.description ?? o.meta_description ?? o.metaDescription) as unknown
  return typeof v === 'string' ? v.trim() : undefined
}

function disclosureFromCompliance(comp: unknown): string {
  if (!comp || typeof comp !== 'object') return DEFAULT_DISCLOSURE
  const o = comp as Record<string, unknown>
  const v = (o.disclosure_text ?? o.disclosure) as unknown
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : DEFAULT_DISCLOSURE
}

function bodyFromCompliance(comp: unknown, original: string): string {
  if (!comp || typeof comp !== 'object') return original
  const o = comp as Record<string, unknown>
  const edited = o.edited_body_md as unknown
  // mock 은 '<원문 그대로>' 같은 placeholder 를 내므로 50자 이상이고 '<원문' 이 없을 때만 사용
  if (typeof edited === 'string' && edited.length > 50 && !edited.includes('<원문')) {
    return edited
  }
  return original
}

export type PublisherOpts = {
  /** 기본값: process.env.ADMIN_AUTO_PUSH === 'true' */
  autoPush?: boolean
}

export async function publishDraft(
  draftId: string,
  db: DB,
  opts: PublisherOpts = {}
): Promise<PublishResult> {
  const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(draftId) as
    | DraftRow
    | undefined
  if (!draft) return { success: false, error: 'draft_not_found' }
  if (draft.status === 'published') {
    return { success: false, error: 'already_published' }
  }
  if (draft.status !== 'ready') {
    return { success: false, error: `draft_status_not_ready: ${draft.status}` }
  }
  if (!draft.step_body_md || draft.step_body_md.trim().length < 50) {
    return { success: false, error: 'body_md_empty_or_too_short' }
  }

  // 1. 어필리에이트 링크 재검증
  const picks = normalizePicks(draft.step_picks)
  const urls = extractUrls(picks)
  let validation: LinkValidationSummary | undefined
  if (urls.length > 0) {
    validation = await validateAllLinks(picks)
    db.prepare('UPDATE drafts SET link_validation = ? WHERE id = ?').run(
      JSON.stringify(validation),
      draftId
    )
    if (!validation.allValid) {
      return {
        success: false,
        error: `affiliate_links_invalid: ${validation.total - validation.validCount}/${validation.total} 실패`,
        validation,
      }
    }
  }

  // 2. slug / 제목 / 설명 결정
  const seo = parseJSON<Record<string, unknown>>(draft.step_seo)
  const seoSlug = pickSlugFromSeo(seo)
  const title = pickTitleFromSeo(seo, draft.topic)
  const description = pickDescFromSeo(seo)
  const baseSlug = slugify(seoSlug ?? draft.topic, draftId)
  const slug = await uniqueSlug(draft.category, baseSlug)

  // 3. 본문 결정 (compliance 가 보강한 본문이 있으면 우선)
  const compliance = parseJSON<Record<string, unknown>>(draft.step_compliance)
  const body = bodyFromCompliance(compliance, draft.step_body_md)
  const disclosure = disclosureFromCompliance(compliance)

  const nowIso = new Date().toISOString()
  const heroImage = `/images/articles/${slug}/hero.jpg` // Day 4 에서 실제 생성

  const meta: Meta = {
    slug,
    category: draft.category,
    title,
    dek: description,
    description,
    published: nowIso,
    updated: nowIso,
    author: 'Saint-Rémy Editors',
    heroImage,
    thumbnailColor: '#2A1810',
    affiliateDisclosure: disclosure,
    picks,
    draftId,
    publishedAt: nowIso,
  }

  const fileContent = `${buildFrontmatter(meta)}\n\n${body.trim()}\n`
  const dirAbs = path.join(ARTICLES_DIR, draft.category)
  const fileAbs = path.join(dirAbs, `${slug}.md`)
  const fileRel = path.relative(REPO_ROOT, fileAbs)
  const articlesJsonRel = path.relative(REPO_ROOT, ARTICLES_JSON)

  // 4. 파일 저장
  await fs.mkdir(dirAbs, { recursive: true })
  await fs.writeFile(fileAbs, fileContent, 'utf-8')

  // 5. content build (validation + articles.json 갱신)
  try {
    execFileSync('npm', ['run', 'build:content'], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 60_000,
    })
  } catch (err) {
    // 롤백: .md 파일 제거 (articles.json 은 build 가 다시 정리)
    await fs.unlink(fileAbs).catch(() => undefined)
    const out = err instanceof Error ? err.message : String(err)
    const stderr = (err as { stderr?: Buffer }).stderr?.toString() ?? ''
    return { success: false, error: `build_failed: ${stderr || out}`.slice(0, 500) }
  }

  // 6. git add + commit
  let commit: string
  let pushed = false
  let branch: string | undefined
  try {
    branch = gitCurrentBranch()
    gitAdd([fileRel, articlesJsonRel])
    const msg = `feat(content): publish ${slug}\n\nAuto-published from Saint-Rémy Editor (draft ${draftId})\nCategory: ${draft.category}\nTitle: ${title}`
    commit = gitCommit(msg)
  } catch (err) {
    // commit 실패해도 파일은 디스크에 남아있음. 사용자가 직접 처리 가능.
    return {
      success: false,
      error: `git_failed: ${err instanceof Error ? err.message : String(err)}`,
      filePath: fileRel,
    }
  }

  // 7. push (옵션)
  const wantPush = opts.autoPush ?? process.env.ADMIN_AUTO_PUSH === 'true'
  if (wantPush) {
    try {
      gitPush(branch)
      pushed = true
    } catch (err) {
      // push 실패는 발행 자체는 성공으로 간주 (commit 됨), 사용자가 수동 push 가능
      return {
        success: true,
        filePath: fileRel,
        liveUrl: `${SITE_BASE_URL}/${draft.category}/${slug}`,
        commit,
        branch,
        pushed: false,
        validation,
        error: `push_failed: ${err instanceof Error ? err.message : String(err)}`,
      }
    }
  }

  // 8. drafts UPDATE
  const liveUrl = `${SITE_BASE_URL}/${draft.category}/${slug}`
  const headCommit = gitHeadCommit()
  db.prepare(
    `UPDATE drafts SET
       status = 'published',
       publish_path = ?,
       publish_commit = ?,
       published_url = ?,
       published_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(fileRel, headCommit, liveUrl, draftId)

  return {
    success: true,
    filePath: fileRel,
    liveUrl,
    commit: headCommit,
    branch,
    pushed,
    validation,
  }
}
