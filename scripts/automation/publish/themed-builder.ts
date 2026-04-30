// Saint-Rémy Editors — Themed Roundup Builder
// 시즌·테마 기사를 100% 검증된 데이터로 생성하는 zero-touch 파이프라인.
//
// 핵심 원칙
// 1. 모든 상품은 Coupang search API 결과에서만 선정 (환각 방지)
// 2. 각 슬롯마다 키워드 검색 → 필터링(가격대, 액세서리 제외) → 톱 후보 선정
// 3. productImage URL 자동 다운로드
// 4. productUrl은 search 응답의 어필리에이트 URL 그대로 사용 (이미 추적 파라미터 포함)
// 5. 검증 게이트: PENDING 잔존 / 빈 이미지 폴더 / non-coupang URL 자동 차단
// 6. hero는 hero_t1.py로 좌우 2분할 합성 (rembg 배경 제거)
//
// 사용:
//   npx tsx scripts/automation/publish/themed-builder.ts --config configs/kugase-2026.json
//   npx tsx scripts/automation/publish/themed-builder.ts --config configs/kugase-2026.json --dry
//
// 향후 확장: editor-in-chief 에이전트가 .md 직접 작성하지 않고 이 스크립트 호출하도록 강제.

import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { spawnSync } from 'node:child_process'
import { searchProducts, convertDeeplink, type CoupangProduct } from '../api/coupang-client.js'

// ───────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────

interface SlotConfig {
  label: string             // "01. 노트북" — sectionTitle prefix
  productLabel: string      // "노트북" — short label for body/alt
  searchKeyword: string     // Coupang search keyword
  minPrice?: number
  maxPrice?: number
  excludeKeywords?: string[]
  /** 에디터 코멘트 (1~2 문장). 매거진 톤 유지. */
  editorialBody: string
  /** 가격 변동 감지를 위해 originalPrice 표기 여부 */
  showOriginalPrice?: boolean
  badge?: string            // "쿠가세 단일 ₩410,000 ↓" 같은 시즌 배지
}

interface ThemedConfig {
  slug: string
  /** 디스크상 카테고리 폴더명 (deals/style/home/etc) */
  categoryFolder: string
  /** Article frontmatter category 값 */
  category: string
  /** UI 라벨 (DEALS / STYLE 등) */
  categoryLabel: string
  /** hero_t1.py palette 카테고리 (deal/beauty/gift 등) */
  heroPalette: string
  title: string
  dek: string
  summary: string
  publishedAt: string       // YYYY-MM-DD
  readTime: number
  seasonal?: { endDate: string }
  featuredOn?: string[]     // ['Hero']
  tags: string[]
  affiliateDisclosure: string
  lede: string              // 본문 도입 1~2 문단
  pickingCriteria: string   // "어떻게 골랐나" 섹션 본문
  closer: string            // 마무리 문단
  slots: SlotConfig[]
}

interface ResolvedSlot extends SlotConfig {
  product: CoupangProduct
  index: number             // 1-based
  imageNum: string          // "01"
  localImagePath: string    // /images/articles/{slug}/01.jpg
  shortDeeplink?: string    // link.coupang.com/a/XXXXX (optional)
}

// ───────────────────────────────────────────────────────────────────
// Utils
// ───────────────────────────────────────────────────────────────────

function loadDotenv() {
  const p = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
}

function downloadImage(url: string, dest: string, redirectsLeft = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('http://') ? require('node:http') : https
    lib
      .get(url, (res: any) => {
        // 301/302 follow
        if ([301, 302, 307, 308].includes(res.statusCode)) {
          if (redirectsLeft <= 0) {
            reject(new Error(`too many redirects for ${url}`))
            return
          }
          const next = res.headers.location
          if (!next) {
            reject(new Error(`${res.statusCode} but no Location header`))
            return
          }
          res.resume()
          const absolute = next.startsWith('http') ? next : new URL(next, url).toString()
          downloadImage(absolute, dest, redirectsLeft - 1).then(resolve).catch(reject)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`download ${res.statusCode}`))
          return
        }
        const out = fs.createWriteStream(dest)
        res.pipe(out)
        out.on('finish', () => out.close(() => resolve()))
        out.on('error', reject)
      })
      .on('error', reject)
  })
}

function escapeYaml(s: string): string {
  return s.replace(/'/g, "''")
}

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

// ───────────────────────────────────────────────────────────────────
// Slot resolver — 각 슬롯의 정확한 상품 1개 선정
// ───────────────────────────────────────────────────────────────────

function passesFilters(p: CoupangProduct, slot: SlotConfig): boolean {
  if (slot.minPrice && p.productPrice < slot.minPrice) return false
  if (slot.maxPrice && p.productPrice > slot.maxPrice) return false
  if (slot.excludeKeywords?.length) {
    for (const ex of slot.excludeKeywords) {
      if (p.productName.includes(ex)) return false
    }
  }
  return true
}

/** 쿠팡 search API 안정 호출 — limit > 5에서 0건 반환하는 버그를 우회.
 *  여러 키워드를 순차 시도해서 unique 상품 풀을 만든다. */
async function searchPool(keywords: string[]): Promise<CoupangProduct[]> {
  const seen = new Set<number>()
  const pool: CoupangProduct[] = []
  for (const k of keywords) {
    try {
      const r = await searchProducts(k, 5)
      for (const p of r?.productData ?? []) {
        if (!seen.has(p.productId)) {
          seen.add(p.productId)
          pool.push(p)
        }
      }
      // rate limit 보호
      await new Promise((r) => setTimeout(r, 200))
    } catch (e: any) {
      console.log(`       (검색 "${k}" 실패: ${e.message})`)
    }
  }
  return pool
}

async function resolveSlot(
  slot: SlotConfig,
  index: number,
  excludedProductIds: Set<number>,
): Promise<CoupangProduct | null> {
  console.log(`\n[${String(index).padStart(2, '0')}] "${slot.searchKeyword}" 검색…`)
  const keywords = [slot.searchKeyword]
  if ((slot as any).alternateKeywords) {
    keywords.push(...(slot as any).alternateKeywords)
  }
  const pool = await searchPool(keywords)
  console.log(`     pool ${pool.length}건 / 가격필터 ${slot.minPrice ?? '-'}~${slot.maxPrice ?? '-'} / 제외 ${slot.excludeKeywords?.length ?? 0}개 / 중복차단 ${excludedProductIds.size}개`)
  if (pool.length === 0) {
    console.log(`     ✗ 검색 결과 0건`)
    return null
  }
  // 중복 productId 사전 차단 + 가격·키워드 필터
  const filtered = pool.filter((p) => !excludedProductIds.has(p.productId) && passesFilters(p, slot))
  console.log(`     필터 통과: ${filtered.length}건`)
  if (filtered.length === 0) {
    pool.slice(0, 5).forEach((p) => {
      const reasons: string[] = []
      if (excludedProductIds.has(p.productId)) reasons.push(`중복`)
      if (slot.minPrice && p.productPrice < slot.minPrice) reasons.push(`가격↓ ${fmtPrice(p.productPrice)}`)
      if (slot.maxPrice && p.productPrice > slot.maxPrice) reasons.push(`가격↑ ${fmtPrice(p.productPrice)}`)
      slot.excludeKeywords?.forEach((ex) => {
        if (p.productName.includes(ex)) reasons.push(`제외[${ex}]`)
      })
      console.log(`       - ${p.productName.slice(0, 60)} → ${reasons.join(', ') || 'OK'}`)
    })
    return null
  }
  const top = filtered[0]
  console.log(`     ✓ ${top.productName.slice(0, 50)}  ${fmtPrice(top.productPrice)}${top.isRocket ? ' 🚀' : ''}`)
  return top
}

// ───────────────────────────────────────────────────────────────────
// Hero composition — hero_t1.py 호출
// ───────────────────────────────────────────────────────────────────

async function composeHero(resolvedSlots: ResolvedSlot[], imgDir: string, palette: string): Promise<string> {
  // 가격 spread가 큰 두 개를 좌·우에 배치 (가성비 vs 프리미엄)
  const sorted = [...resolvedSlots].sort((a, b) => a.product.productPrice - b.product.productPrice)
  const left = sorted[0]
  const right = sorted[sorted.length - 1]
  const heroOut = path.join(imgDir, 'hero.jpg')
  const leftLocal = path.join(imgDir, `${left.imageNum}.jpg`)
  const rightLocal = path.join(imgDir, `${right.imageNum}.jpg`)
  console.log(`\nHERO 합성: 좌 ${left.label} (${fmtPrice(left.product.productPrice)}) / 우 ${right.label} (${fmtPrice(right.product.productPrice)})`)
  const py = spawnSync(
    'python3',
    [
      'scripts/automation/hero/hero_t1.py',
      '--left', leftLocal,
      '--right', rightLocal,
      '--category', palette,
      '--out', heroOut,
    ],
    { stdio: 'inherit' },
  )
  if (py.status !== 0) throw new Error('hero_t1.py 실패')
  return heroOut
}

// ───────────────────────────────────────────────────────────────────
// Frontmatter + body 생성
// ───────────────────────────────────────────────────────────────────

function renderRoundupYaml(slots: ResolvedSlot[]): string {
  return slots
    .map((s) => {
      const sectionTitle = `${s.imageNum}. ${s.productLabel} — ${s.product.productName.slice(0, 40)}`
      const url = s.shortDeeplink ?? s.product.productUrl
      const yaml = [
        `  - sectionTitle: '${escapeYaml(sectionTitle)}'`,
        `    productName: '${escapeYaml(s.product.productName)}'`,
        `    productImage: '${s.localImagePath}'`,
        `    productImageAlt: '${escapeYaml(s.product.productName)} — 쿠팡 ${s.productLabel}'`,
        `    price: '${fmtPrice(s.product.productPrice)}'`,
        `    body: '${escapeYaml(s.editorialBody)}'`,
        `    merchant: 'coupang'`,
        `    productUrl: '${url}'`,
        `    ctaLabel: '쿠팡에서 보기'`,
      ]
      if (s.badge) yaml.push(`    badge: '${escapeYaml(s.badge)}'`)
      return yaml.join('\n')
    })
    .join('\n\n')
}

function renderArticle(config: ThemedConfig, slots: ResolvedSlot[]): string {
  const seasonal = config.seasonal
    ? `seasonal: true\nseasonEndDate: '${config.seasonal.endDate}'\n`
    : ''
  const featuredOn = config.featuredOn?.length
    ? `featuredOn:\n${config.featuredOn.map((f) => `  - ${f}`).join('\n')}\n`
    : ''
  const fm = `---
id: ${config.slug}
slug: '${config.slug}'
title: '${escapeYaml(config.title)}'
dek: '${escapeYaml(config.dek)}'
category: '${config.category}'
categoryLabel: '${config.categoryLabel}'
published: '${config.publishedAt}'
readTime: ${config.readTime}
updatedAt: '${config.publishedAt}'
priceUpdatedAt: '${config.publishedAt}'
author: 'Saint-Rémy Editors'
summary: '${escapeYaml(config.summary)}'
heroImage: '/images/articles/${config.slug}/hero.jpg'
heroImageAlt: '${escapeYaml(config.title)} — Saint-Rémy Editors'
ogImage: '/images/articles/${config.slug}/hero.jpg'
${seasonal}${featuredOn}tags:
${config.tags.map((t) => `  - '${t}'`).join('\n')}
affiliateDisclosure: >-
  ${config.affiliateDisclosure}
roundup:
${renderRoundupYaml(slots)}
---

## ${config.title}

${config.lede}

## 어떻게 골랐나

${config.pickingCriteria}

## 이번 시즌 베스트 ${slots.length}

[ROUNDUP 1-${slots.length}]

## 우리가 검증할 수 없는 것

정직하게 밝힌다.

1. **각 제품의 실제 체감 만족도**: 본 글은 쿠팡 베스트셀러 순위·배송 정책·가격대 데이터에 근거한다. Saint-Rémy Editors가 ${slots.length}개 제품을 동일 조건에서 시험 사용한 결과를 비교한 것은 아니다.
2. **표기 가격의 시장가 부합 여부**: 모든 시즌 핫딜의 공통 한계.
3. **재고 변동**: 인기 상품은 빠르게 품절될 수 있다.

본 페이지의 모든 가격, 순위, 배송 정보는 **${config.publishedAt} 쿠팡 페이지 표기 기준**이며 시간이 지나면 변동될 수 있다. 구매 전 가격을 다시 확인하기 바란다.

${config.closer}
`
  return fm
}

// ───────────────────────────────────────────────────────────────────
// Validation gates — publish 전 자동 차단
// ───────────────────────────────────────────────────────────────────

function validate(content: string, slug: string): void {
  const errors: string[] = []
  if (/PENDING-\d+/.test(content)) errors.push('PENDING-XX 잔존')
  const urlMatches = content.match(/productUrl:\s*'([^']+)'/g) ?? []
  for (const u of urlMatches) {
    if (!u.includes('link.coupang.com')) errors.push(`비-쿠팡 URL: ${u}`)
  }
  const imgDir = path.resolve(process.cwd(), 'public/images/articles', slug)
  if (!fs.existsSync(imgDir)) errors.push(`이미지 폴더 없음: ${imgDir}`)
  else {
    const files = fs.readdirSync(imgDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    if (files.length === 0) errors.push(`이미지 폴더 비어있음: ${imgDir}`)
  }
  if (errors.length > 0) {
    console.error('\n❌ 검증 실패 — publish 차단:')
    errors.forEach((e) => console.error('   ' + e))
    throw new Error(`Validation failed: ${errors.length} errors`)
  }
  console.log('\n✓ 검증 통과 (PENDING 0 / 모든 productUrl 쿠팡 / 이미지 폴더 존재)')
}

// ───────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────

async function main() {
  loadDotenv()
  const args = process.argv.slice(2)
  const cfgIdx = args.indexOf('--config')
  if (cfgIdx === -1 || !args[cfgIdx + 1]) {
    console.error('사용: tsx themed-builder.ts --config <path-to-config.json> [--dry]')
    process.exit(1)
  }
  const cfgPath = path.resolve(args[cfgIdx + 1])
  const dryRun = args.includes('--dry')
  const config = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as ThemedConfig
  console.log(`📰 ${config.slug}`)
  console.log(`   ${config.title}`)
  console.log(`   ${config.slots.length} 슬롯`)

  // 1. 각 슬롯 resolve — 이전 슬롯과 중복 productId 차단
  const resolved: ResolvedSlot[] = []
  const usedProductIds = new Set<number>()
  for (let i = 0; i < config.slots.length; i++) {
    const slot = config.slots[i]
    const product = await resolveSlot(slot, i + 1, usedProductIds)
    if (!product) {
      throw new Error(`슬롯 [${slot.label}] 매칭 실패. 키워드 또는 가격대 조정 필요.`)
    }
    usedProductIds.add(product.productId)
    const num = String(i + 1).padStart(2, '0')
    resolved.push({
      ...slot,
      product,
      index: i + 1,
      imageNum: num,
      localImagePath: `/images/articles/${config.slug}/${num}.jpg`,
    })
  }

  // 2. deeplink 단축 (선택적 — 실패해도 long URL fallback)
  console.log(`\n🔗 deeplink 단축 시도…`)
  try {
    const longs = resolved.map((r) => r.product.productUrl)
    const shorts = await convertDeeplink(longs)
    if (shorts.length === longs.length) {
      resolved.forEach((r, i) => {
        r.shortDeeplink = shorts[i].shortenUrl
      })
      console.log(`   ✓ ${shorts.length}개 단축 완료`)
    } else {
      console.log(`   ⚠ 단축 응답 mismatch (${shorts.length}/${longs.length}) — long URL 사용`)
    }
  } catch (e: any) {
    console.log(`   ⚠ 단축 실패 (${e.message}) — long URL 사용`)
  }

  if (dryRun) {
    console.log('\n--dry 모드: 이미지 다운로드/파일 저장 생략. 결과만 출력:')
    resolved.forEach((r) => {
      console.log(`   ${r.imageNum}. ${r.product.productName.slice(0, 60)}  ${fmtPrice(r.product.productPrice)}`)
      console.log(`      ${r.shortDeeplink ?? r.product.productUrl.slice(0, 80)}`)
    })
    return
  }

  // 3. 이미지 다운로드
  const imgDir = path.resolve(process.cwd(), 'public/images/articles', config.slug)
  fs.mkdirSync(imgDir, { recursive: true })
  console.log(`\n🖼  이미지 다운로드 → ${imgDir}`)
  for (const r of resolved) {
    const dest = path.join(imgDir, `${r.imageNum}.jpg`)
    await downloadImage(r.product.productImage, dest)
    console.log(`   ✓ ${r.imageNum}.jpg (${(fs.statSync(dest).size / 1024).toFixed(0)}KB)`)
  }

  // 4. hero 합성
  await composeHero(resolved, imgDir, config.heroPalette)

  // 5. 마크다운 파일 작성
  const articleDir = path.resolve(process.cwd(), 'content/articles', config.categoryFolder)
  fs.mkdirSync(articleDir, { recursive: true })
  const articlePath = path.join(articleDir, `${config.slug}.md`)
  const articleContent = renderArticle(config, resolved)
  fs.writeFileSync(articlePath, articleContent, 'utf8')
  console.log(`\n📝 ${articlePath}`)

  // 6. 검증 게이트
  validate(articleContent, config.slug)

  // 7. build:content 갱신
  console.log(`\n🔧 build:content 실행…`)
  const build = spawnSync('npm', ['run', 'build:content'], { stdio: 'inherit' })
  if (build.status !== 0) throw new Error('build:content 실패')
  const seo = spawnSync('npm', ['run', 'build:seo'], { stdio: 'inherit' })
  if (seo.status !== 0) throw new Error('build:seo 실패')

  console.log(`\n✨ 완료. 다음 단계:`)
  console.log(`   npm run build:nofetch    # 전체 빌드 검증`)
  console.log(`   git add ... && git commit && git push`)
}

main().catch((e) => {
  console.error('\n✗', e.message)
  process.exit(1)
})
