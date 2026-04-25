/**
 * link-validator 단위 테스트.
 *
 * 실행:
 *   tsx scripts/test-link-validator.ts            # 형식 검증만 (오프라인 OK)
 *   NETWORK=1 tsx scripts/test-link-validator.ts  # 실제 HTTP 호출 포함
 */
import '../src/admin/server/_loadEnv.ts'
import {
  isValidAffiliateUrl,
  validateAffiliateLink,
  validateAllLinks,
  extractUrls,
} from '../src/admin/server/lib/link-validator.ts'

type Case = { name: string; run: () => Promise<boolean> | boolean }

const cases: Case[] = [
  {
    name: '쿠팡 어필리에이트 short URL → 형식 OK',
    run: () => isValidAffiliateUrl('https://link.coupang.com/a/evT3bs'),
  },
  {
    name: '쿠팡 정식 상품 URL → 형식 OK',
    run: () => isValidAffiliateUrl('https://www.coupang.com/vp/products/123456789'),
  },
  {
    name: '올리브영 → 형식 OK',
    run: () => isValidAffiliateUrl('https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000123'),
  },
  {
    name: '오늘의집 → 형식 OK',
    run: () => isValidAffiliateUrl('https://ohou.se/productions/12345/selling'),
  },
  {
    name: '네이버 쇼핑 → 형식 OK',
    run: () => isValidAffiliateUrl('https://shopping.naver.com/window/style'),
  },
  {
    name: '네이버 스마트스토어 → 형식 OK',
    run: () => isValidAffiliateUrl('https://smartstore.naver.com/foo/bar'),
  },
  {
    name: 'http (https 아님) → 거부',
    run: () => !isValidAffiliateUrl('http://link.coupang.com/a/evT3bs'),
  },
  {
    name: '비허가 호스트 (aliexpress) → 거부',
    run: () => !isValidAffiliateUrl('https://www.aliexpress.com/item/123.html'),
  },
  {
    name: '빈 문자열 → 거부',
    run: () => !isValidAffiliateUrl(''),
  },
  {
    name: '잘못된 URL → 거부',
    run: () => !isValidAffiliateUrl('not a url'),
  },
  {
    name: 'extractUrls — productUrl / product_url / url 모두 인식',
    run: () => {
      const urls = extractUrls([
        { productUrl: 'https://link.coupang.com/a/AAA' },
        { product_url: 'https://www.oliveyoung.co.kr/store/x' },
        { url: 'https://ohou.se/productions/1/selling' },
        { name: 'no url' },
      ])
      return urls.length === 3
    },
  },
  {
    name: 'validateAffiliateLink — 형식 부적합 즉시 반환 (네트워크 없음)',
    run: async () => {
      const r = await validateAffiliateLink('https://example.com/foo')
      return r.valid === false && r.error === 'invalid_url_format'
    },
  },
  {
    name: 'validateAllLinks — 빈 배열 → allValid=true',
    run: async () => {
      const r = await validateAllLinks([])
      return r.allValid === true && r.total === 0
    },
  },
  {
    name: 'validateAllLinks — 잘못된 URL 1개 → allValid=false',
    run: async () => {
      const r = await validateAllLinks([{ productUrl: 'http://insecure.example.com' }])
      return r.allValid === false && r.results[0].valid === false
    },
  },
]

if (process.env.NETWORK === '1') {
  cases.push(
    {
      name: '[network] 쿠팡 short URL HEAD/GET → status 코드 받음',
      run: async () => {
        const r = await validateAffiliateLink('https://link.coupang.com/a/evT3bs', { timeoutMs: 8000 })
        // 200 일 수도, 404 일 수도. 형식 단계는 통과해야 하고 status 가 숫자여야 함.
        return typeof r.status === 'number' || r.error === 'timeout'
      },
    },
    {
      name: '[network] 존재하지 않을 가능성 큰 코드 → 200/404 어느 쪽이든 status 응답',
      run: async () => {
        const r = await validateAffiliateLink('https://link.coupang.com/a/zzzzzzzz', { timeoutMs: 8000 })
        return typeof r.status === 'number' || typeof r.error === 'string'
      },
    }
  )
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' link-validator unit tests')
  console.log(`  NETWORK=${process.env.NETWORK ?? '0'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  let pass = 0
  let fail = 0
  for (const c of cases) {
    try {
      const ok = await c.run()
      if (ok) {
        console.log(` ✓ ${c.name}`)
        pass++
      } else {
        console.log(` ✗ ${c.name}`)
        fail++
      }
    } catch (err) {
      console.log(` ✗ ${c.name} — threw ${(err as Error).message}`)
      fail++
    }
  }
  console.log('───────────────────────────────────────────────')
  console.log(` ${pass} pass, ${fail} fail (${cases.length} total)`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('fatal:', e)
  process.exit(1)
})
