// 단일 쿼리로 두 책 한 번에 매칭 (rate limit 회피)
import 'dotenv/config'
import { searchProducts } from './api/coupang-client.js'

const { productData } = await searchProducts('우리가 빛의 속도로 갈 수 없다면 김초엽', 30)

const wanted = new Map([
  [232909854, 'book1'],
  [6055183503, 'book2'],
])

const results: any = {}
for (const p of productData) {
  if (wanted.has(p.productId)) {
    results[wanted.get(p.productId)!] = {
      productId: p.productId,
      name: p.productName,
      price: p.productPrice,
      image: p.productImage,
      url: p.productUrl,
    }
  }
}

console.log(JSON.stringify(results, null, 2))
console.log('Total:', productData.length)
