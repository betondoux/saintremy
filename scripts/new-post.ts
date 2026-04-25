// scripts/new-post.ts
//
// 새 기사 파일을 생성하는 스캐폴딩 CLI.
// 사용법: npm run new-post -- <category> <slug> ["제목"]
// 예시:   npm run new-post -- kitchen tefal-ingenio-review "테팔 인제니오 1년 사용기"

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_ROOT = resolve(__dirname, '../content/articles')

const VALID_CATEGORIES = [
  'gift',
  'deal',
  'style',
  'beauty',
  'space',
  'kitchen',
  'move',
  'travel',
  'furniture',
  'living',
  'music',
] as const

const DISCLOSURE =
  '이 기사에는 Saint-Rémy Editors의 어필리에이트 링크가 포함되어 있습니다. 독자의 구매가 발생할 경우 일정 수수료를 제공받으나, 제품 선정은 독립적으로 이루어집니다.'

function usage(): never {
  console.error(`사용법: npm run new-post -- <category> <slug> ["제목"]

유효한 카테고리: ${VALID_CATEGORIES.join(', ')}

예시:
  npm run new-post -- kitchen tefal-ingenio-review "테팔 인제니오 1년 사용기"
  npm run new-post -- beauty spring-moisturizer-5 "봄철 수분크림 BEST 5"
`)
  process.exit(1)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function main() {
  const [, , categoryArg, slugArg, titleArg] = process.argv

  if (!categoryArg || !slugArg) usage()

  const category = categoryArg.trim().toLowerCase()
  const slug = slugArg.trim().toLowerCase()
  const title = (titleArg ?? '새 기사 제목').trim()

  if (!VALID_CATEGORIES.includes(category as any)) {
    console.error(`❌ "${category}" 는 유효한 카테고리가 아닙니다.`)
    usage()
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error(`❌ slug 는 소문자·숫자·하이픈만 사용 가능. 입력: "${slug}"`)
    process.exit(1)
  }

  const outDir = resolve(CONTENT_ROOT, category)
  const outPath = resolve(outDir, `${slug}.md`)

  if (existsSync(outPath)) {
    console.error(`❌ 이미 존재하는 파일: ${outPath}`)
    process.exit(1)
  }

  const template = `---
slug: ${slug}
category: ${category}
title: ${title}
dek: 한 줄 요약. 독자가 왜 이 글을 읽어야 하는지 15~30자.
readTime: 5
published: '${today()}'
author: Saint-Rémy Editors
heroImage: /images/articles/${slug}/hero.jpg
thumbnailColor: '#2A1810'
affiliateDisclosure: >-
  ${DISCLOSURE}
# featuredOn: [Hero]       # 홈 히어로로 노출하려면 주석 해제
# picks: []                # 딜 레이더/상품 카드 형식이면 picks 배열 사용
# sources: []              # 참고 자료
---

여기에 본문을 마크다운으로 작성합니다.

## 섹션 제목

**굵게**, *이탤릭*, [링크 텍스트](https://example.com) 같은 기본 마크다운 전부 사용 가능.

- 불릿 리스트
- 두 번째 항목

---

## 또 다른 섹션

이미지 삽입은: \`[IMAGE] /images/articles/${slug}/foo.jpg | 캡션\`

유튜브: \`[YOUTUBE] VIDEO_ID\`

어필리에이트 링크는 본문 안에 자연스럽게:
[올리브영에서 보기 →](https://oy.run/...)
[쿠팡에서 보기 →](https://link.coupang.com/a/...)
`

  mkdirSync(outDir, { recursive: true })
  writeFileSync(outPath, template)

  console.log(`✅ 새 기사 생성: ${outPath}`)
  console.log(`\n다음 단계:`)
  console.log(`  1. 에디터에서 파일 열기: code "${outPath}"`)
  console.log(`  2. Claude Code 에게 "이 파일 채워줘" 요청`)
  console.log(`  3. npm run build:content (로컬 확인용)`)
  console.log(`  4. git add . && git commit -m "new post: ${slug}" && git push`)
}

main()
