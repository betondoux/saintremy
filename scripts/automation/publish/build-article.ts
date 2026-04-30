// 후보 풀 → 카테고리 픽 → roundup frontmatter → hero 합성 → .md 파일 생성
//
// 사용:
//   npx tsx scripts/automation/publish/build-article.ts --category beauty --slug auto-beauty-2026-04-30

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import https from 'node:https'
import { loadLatestPool, pickByCategory, type ScoredCandidate } from '../scoring/score.js'
import type { SaintremyCategory } from '../api/category-map.js'

interface BuildArgs {
  category: SaintremyCategory
  slug: string
  title?: string
  dek?: string
}

function parseArgs(): BuildArgs {
  const args = process.argv.slice(2)
  const out: any = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const k = args[i].slice(2)
      out[k] = args[i + 1]
      i++
    }
  }
  if (!out.category || !out.slug) {
    throw new Error('--category, --slug 필수')
  }
  return out as BuildArgs
}

function todayKst(): string {
  const d = new Date()
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

const CATEGORY_LABEL_KO: Record<SaintremyCategory, string> = {
  beauty: 'BEAUTY',
  deal: 'SALE',
  gift: 'GIFT',
  kitchen: 'KITCHEN',
  living: 'LIVING',
  move: 'MOVE',
  travel: 'TRAVEL',
  furniture: 'FURNITURE',
  space: 'SPACE',
  style: 'STYLE',
  music: 'MUSIC',
}

const CATEGORY_HOOK_KO: Record<SaintremyCategory, { title: string; dek: string; lead: string }> = {
  beauty: {
    title: '가성비 뷰티 베스트 5',
    dek: '쿠팡 뷰티 카테고리 1~5위 — 1만원대 안에 다 들어가는 라인업.',
    lead: '뷰티 매대에서 가장 많이 팔리는 1~5위는 매년 바뀌지만, 그 라인업이 알려주는 것은 거의 똑같다. 한국 소비자가 *지금* 가장 많이 사는 가성비 보습·헤어·바디 라인이 뭔지.',
  },
  deal: {
    title: '오늘의 골드박스 5선',
    dek: '쿠팡 골드박스 핫딜 중 매거진 톤에 맞는 5개.',
    lead: '쿠팡 골드박스는 매일 갱신된다. 오늘 자 골드박스 25개 중 Saint-Rémy Editors가 다섯 개를 골랐다.',
  },
  gift: {
    title: '이번 주 선물 베스트 5',
    dek: '쿠팡 선물 카테고리 인기 1~5위 — 받는 사람이 부담 없을 가격대.',
    lead: '선물의 어려움은 가격이 아니라 *과하지 않은가*에 있다. 이번 주 가장 많이 팔린 선물 라인업에서, Saint-Rémy Editors가 다섯 개를 골랐다.',
  },
  kitchen: {
    title: '이번 주 주방용품 5선',
    dek: '쿠팡 주방용품 베스트 1~5위 — 좁은 주방에서 매일 쓰는 것들.',
    lead: '주방용품의 정답은 가격이 아니라 *매일 손이 가는가*에 있다. 이번 주 가장 많이 팔린 주방 라인업에서 다섯 개.',
  },
  living: {
    title: '이번 주 생활용품 5선',
    dek: '쿠팡 생활·헬스 베스트 — 자주 쓰는데 잊기 쉬운 것들.',
    lead: '생활용품은 한 번 사두면 잊히지만, 떨어지면 가장 먼저 알아챈다. 이번 주 가장 많이 팔린 생활 라인업에서 다섯 개.',
  },
  move: {
    title: '이번 주 운동용품 5선',
    dek: '쿠팡 스포츠·레저 베스트 — 시작하는 사람을 위한 라인업.',
    lead: '운동의 시작은 장비가 아니지만, 시작 후 며칠 만에 장비가 결정한다. 이번 주 가장 많이 팔린 라인업에서 다섯 개.',
  },
  travel: {
    title: '이번 주 여행 5선',
    dek: '쿠팡 여행 베스트 — 떠나기 전 가장 많이 검색되는 것들.',
    lead: '여행을 결정한 다음 가장 먼저 사는 것이 무엇인지를 보면, 그 시즌의 여행 트렌드가 보인다. 이번 주 다섯 개.',
  },
  furniture: {
    title: '이번 주 가구 5선',
    dek: '쿠팡 홈인테리어 베스트 — 좁은 공간에서 결정의 무게가 큰 카테고리.',
    lead: '가구는 한 번 사면 5년을 같이 산다. 이번 주 가장 많이 팔린 라인업에서, 매거진 톤에 맞는 다섯 개.',
  },
  space: {
    title: '이번 주 공간 5선',
    dek: '쿠팡 인테리어·생활 베스트 — 작은 변화로 방의 톤이 바뀌는 것들.',
    lead: '공간은 가구가 아니라 디테일이 결정한다. 이번 주 가장 많이 팔린 인테리어 라인업에서 다섯 개.',
  },
  style: {
    title: '이번 주 패션 베스트 5',
    dek: '쿠팡 패션 베스트 — 매대 위 인기 1~5위.',
    lead: '패션 카테고리에서 가장 많이 팔린 다섯 개를 보는 것은, 지금 한국이 무엇을 입고 있는지를 가장 빠르게 보는 방법이다.',
  },
  music: {
    title: '이번 주 음향 5선',
    dek: '쿠팡 음향·가전 베스트 — 듣기 좋은 가격대의 라인업.',
    lead: '소리는 비싼 게 좋지만, 처음에는 가성비가 정답이다. 이번 주 다섯 개.',
  },
}

function pickHeroPair(picks: ScoredCandidate[]): [ScoredCandidate, ScoredCandidate] {
  if (picks.length < 2) throw new Error('최소 2개 픽 필요')
  const sorted = [...picks].sort((a, b) => a.productPrice - b.productPrice)
  const cheapest = sorted[0]
  const priciest = sorted[sorted.length - 1]
  const spread = priciest.productPrice / Math.max(1, cheapest.productPrice)
  // 가격 spread가 1.6배 이상이면 양 끝, 아니면 top 1 + top 2
  if (spread >= 1.6) return [cheapest, priciest]
  return [picks[0], picks[1]]
}

function escapeYaml(s: string): string {
  // single-line: 작은따옴표 안에 들어갈 텍스트, ' → ''
  return s.replace(/'/g, "''")
}

function buildRoundupYaml(picks: ScoredCandidate[], slug: string, category: SaintremyCategory): string {
  return picks
    .map((p, idx) => {
      const i = idx + 1
      const num = String(i).padStart(2, '0')
      const local = `/images/articles/${slug}/${num}-${slug}.jpg`
      return `  - sectionTitle: '${num}. ${escapeYaml(p.productName)}'
    productName: '${escapeYaml(p.productName)}'
    productImage: '${local}'
    productImageAlt: '${escapeYaml(p.productName)} — 쿠팡 ${category}'
    price: '${p.productPrice.toLocaleString()}원'
    body: '쿠팡 ${p.coupangCategoryLabel ?? category} 카테고리 rank ${p.rank ?? '-'}. ${p.isRocket ? '로켓배송 ' : ''}${p.isFreeShipping ? '· 무료배송' : ''}. 이번 주 베스트셀러 라인업에서 매거진 톤으로 골랐다.'
    merchant: 'coupang'
    productUrl: '${p.productUrl}'
    ctaLabel: '쿠팡에서 보기'`
    })
    .join('\n\n')
}

async function downloadImage(url: string, dest: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    https
      .get(url, (res) => {
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

async function main() {
  const args = parseArgs()
  const today = todayKst()
  const pool = loadLatestPool()
  console.log(`[1/5] 카테고리 픽 — ${args.category}`)
  const pick = pickByCategory(pool, args.category, 5)
  if (pick.topPicks.length < 5) {
    throw new Error(`${args.category} 후보 부족 (${pick.topPicks.length}/5)`)
  }
  pick.topPicks.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.score.toFixed(2)}] ${p.productName} — ${p.productPrice.toLocaleString()}원`)
  })

  console.log(`\n[2/5] 제품 이미지 다운로드`)
  const imgDir = path.resolve(process.cwd(), 'public/images/articles', args.slug)
  fs.mkdirSync(imgDir, { recursive: true })
  for (let i = 0; i < pick.topPicks.length; i++) {
    const p = pick.topPicks[i]
    const num = String(i + 1).padStart(2, '0')
    const local = path.join(imgDir, `${num}-${args.slug}.jpg`)
    if (!fs.existsSync(local)) {
      await downloadImage(p.productImage, local)
    }
    console.log(`  ✓ ${num}-${args.slug}.jpg`)
  }

  console.log(`\n[3/5] HERO 합성 (T1 좌우 2분할)`)
  const [heroLeft, heroRight] = pickHeroPair(pick.topPicks)
  const heroOut = path.join(imgDir, 'hero.jpg')
  // 이미 다운로드된 로컬 파일을 hero에 사용 (rembg가 URL 다운로드보다 안정)
  const leftIdx = pick.topPicks.indexOf(heroLeft) + 1
  const rightIdx = pick.topPicks.indexOf(heroRight) + 1
  const leftLocal = path.join(imgDir, `${String(leftIdx).padStart(2, '0')}-${args.slug}.jpg`)
  const rightLocal = path.join(imgDir, `${String(rightIdx).padStart(2, '0')}-${args.slug}.jpg`)
  const py = spawnSync(
    'python3',
    [
      'scripts/automation/hero/hero_t1.py',
      '--left', leftLocal,
      '--right', rightLocal,
      '--category', args.category,
      '--out', heroOut,
    ],
    { stdio: 'inherit' },
  )
  if (py.status !== 0) throw new Error('hero_t1.py 실패')

  console.log(`\n[4/5] frontmatter + 본문 작성`)
  const hook = CATEGORY_HOOK_KO[args.category]
  const title = args.title ?? hook.title
  const dek = args.dek ?? hook.dek
  const labelKo = CATEGORY_LABEL_KO[args.category]
  const tags = [labelKo.toLowerCase(), 'roundup', 'best5', '쿠팡베스트', args.category]
  const fm = `---
id: ${args.slug}
slug: '${args.slug}'
title: '${escapeYaml(title)}'
dek: '${escapeYaml(dek)}'
category: '${args.category}'
categoryLabel: '${labelKo}'
published: '${today}'
updatedAt: '${today}'
readTime: 5
author: 'Saint-Rémy Editors'
summary: '${escapeYaml(hook.lead.replace(/\*/g, ''))}'
heroImage: '/images/articles/${args.slug}/hero.jpg'
heroImageAlt: '${escapeYaml(title)} — Saint-Rémy Editors'
tags:
${tags.map((t) => `  - '${t}'`).join('\n')}
affiliateDisclosure: >-
  본 게시글은 쿠팡파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
  제공받습니다. 추천 제품은 쿠팡 베스트셀러 표기 정보를 기준으로
  Saint-Rémy Editors가 큐레이션했으며, 제품의 실제 효능이나 정가의
  시장가 부합 여부는 본 글의 검증 범위 밖에 있습니다.
roundup:
${buildRoundupYaml(pick.topPicks, args.slug, args.category)}
---

## ${title}

${hook.lead}

오늘은 쿠팡 ${labelKo} 카테고리 베스트셀러 1~5위에서 ${pick.topPicks.length}개를 골랐다. 가격 낮은 순이 아니라 **rank·로켓배송·무료배송·적정 가격대 가중 점수** 상위 5개. 매거진 톤에 맞는 라인업.

## 선정 기준

이번 큐레이션에서 우리가 본 것은 네 가지다.

1. **쿠팡 ${labelKo} 카테고리 베스트셀러 상위권** (rank 30위 이내)
2. **로켓배송 또는 무료배송** (배송 신뢰)
3. **적정 가격대** (카테고리 평균 대비 매거진 톤 부합)
4. **본 발행 시점 ${today} 기준 즉시 구매 가능**

가격 낮은 순으로 정렬한다.

## 이번 주 베스트 5

[ROUNDUP 1-5]

## 우리가 검증할 수 없는 것

정직하게 밝힌다.

1. **각 제품의 실제 효능·체감 만족도**: 본 글은 쿠팡 베스트셀러 순위·배송 정책·가격대 데이터에 근거한다. Saint-Rémy Editors가 ${pick.topPicks.length}개 제품을 동일 조건에서 시험 사용한 결과를 비교한 것은 아니다.
2. **표기 가격의 시장가 부합 여부**: 모든 쿠팡 핫딜의 공통 한계.
3. **재고 변동**: 인기 상품은 빠르게 품절될 수 있다.

본 페이지의 모든 가격, 순위, 배송 정보는 **${today} 쿠팡 페이지 표기 기준**이며 시간이 지나면 변동될 수 있다. 구매 전 가격을 다시 확인하기 바란다.
`

  const articleDir = path.resolve(process.cwd(), 'content/articles', args.category)
  fs.mkdirSync(articleDir, { recursive: true })
  const articlePath = path.join(articleDir, `${args.slug}.md`)
  fs.writeFileSync(articlePath, fm)
  console.log(`  ✓ ${articlePath}`)

  console.log(`\n[5/5] build:content 검증`)
  const build = spawnSync('npm', ['run', 'build:content'], { stdio: 'inherit' })
  if (build.status !== 0) throw new Error('build:content 실패')

  console.log(`\n✨ 완료. 다음 단계:`)
  console.log(`  1. 검토:  open content/articles/${args.category}/${args.slug}.md`)
  console.log(`  2. hero:  open public/images/articles/${args.slug}/hero.jpg`)
  console.log(`  3. push:  git add ... && git commit && git push`)
}

main().catch((e) => {
  console.error('✗', e.message)
  process.exit(1)
})
