// src/content/products.ts
//
// 빌드 타임에 Notion Products DB에서 가져온 generated/products.json을 로드.
// Notion 미연결 시 폴백 데이터 사용.

import productsData from '../generated/products.json'

export type ProductCategory =
  | 'lift'
  | 'combat'
  | 'football'
  | 'run'
  | 'flow'
  | 'court'
  | 'books'

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  category: ProductCategory
  price: number
  originalPrice?: number
  image?: string
  thumbnailColor?: string
  dek: string
  description?: string
  affiliateURL: string
  vendor: string
  featured?: boolean
  relatedArticleSlug?: string
}

export const CATEGORY_LABELS_PRODUCT: Record<ProductCategory, string> = {
  lift: 'LIFT',
  combat: 'COMBAT',
  football: 'FOOTBALL',
  run: 'RUN',
  flow: 'FLOW',
  court: 'COURT',
  books: 'BOOKS',
}

export const products: Product[] = productsData as unknown as Product[]

// ─────────────────────────────────────────────────────────────
// Helper 함수들
// ─────────────────────────────────────────────────────────────

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(
  category: ProductCategory,
): Product[] {
  return products.filter((p) => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured).slice(0, 12)
}

export function getAllProducts(): Product[] {
  return products
}

/**
 * 특정 기사와 연결된 상품 찾기 (AMATOR PICK 자리용).
 * Notion에서 relatedArticleSlug 필드로 연결.
 */
export function getProductForArticle(
  articleSlug: string,
): Product | undefined {
  return products.find((p) => p.relatedArticleSlug === articleSlug)
}

/**
 * 할인율 계산 (0~100)
 */
export function getDiscountPercent(product: Product): number {
  if (!product.originalPrice || product.originalPrice <= product.price) return 0
  return Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  )
}

/**
 * 원 표기 (127,800원)
 */
export function formatPrice(price: number): string {
  return `₩${price.toLocaleString('ko-KR')}`
}
