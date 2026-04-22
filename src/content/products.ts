// src/content/products.ts
//
// 빌드 타임에 Notion Products DB에서 가져온 generated/products.json을 로드.
// Notion 미연결 시 폴백 데이터 사용.
// 10개 한국어 카테고리로 확장 (선물/할인/스타일/뷰티/공간/주방/운동/여행/가구/생활).
// 기존 6개 스포츠 카테고리는 '운동(move)'으로 자동 매핑.

import productsData from '../generated/products.json'

// 10개 카테고리 + books (책은 별도 유지)
export type ProductCategory =
  | 'gift'
  | 'deal'
  | 'style'
  | 'beauty'
  | 'space'
  | 'kitchen'
  | 'move'
  | 'travel'
  | 'furniture'
  | 'living'
  | 'books'

// 레거시 카테고리 (Notion 데이터 호환용)
type LegacyProductCategory =
  | 'lift'
  | 'combat'
  | 'football'
  | 'run'
  | 'flow'
  | 'court'

// 레거시 → 'move'로 매핑
const LEGACY_TO_MOVE: Record<LegacyProductCategory, ProductCategory> = {
  lift: 'move',
  combat: 'move',
  football: 'move',
  run: 'move',
  flow: 'move',
  court: 'move',
}

// 모든 유효 카테고리 (타입 가드용)
const ALL_PRODUCT_CATEGORIES: ProductCategory[] = [
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
  'books',
]

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

// Bilingual 라벨 (UI 표시용) — "English (한글)"
export const CATEGORY_LABELS_PRODUCT: Record<ProductCategory, string> = {
  gift: 'Gift (선물)',
  deal: 'Deal (할인)',
  style: 'Style (스타일)',
  beauty: 'Beauty (뷰티)',
  space: 'Space (공간)',
  kitchen: 'Kitchen (주방)',
  move: 'Move (운동)',
  travel: 'Travel (여행)',
  furniture: 'Furniture (가구)',
  living: 'Living (생활)',
  books: 'Books (책)',
}

// ─────────────────────────────────────────────────────────────
// Notion 데이터 정제 — 레거시 카테고리 자동 매핑
// ─────────────────────────────────────────────────────────────
const normalizeProductCategory = (cat: string): ProductCategory => {
  if (cat in LEGACY_TO_MOVE) {
    return LEGACY_TO_MOVE[cat as LegacyProductCategory]
  }
  if (ALL_PRODUCT_CATEGORIES.includes(cat as ProductCategory)) {
    return cat as ProductCategory
  }
  // 알 수 없는 카테고리 → 'living'으로 fallback (안전)
  return 'living'
}

type RawProduct = Omit<Product, 'category'> & { category: string }

export const products: Product[] = (productsData as unknown as RawProduct[]).map(
  (product) => ({
    ...product,
    category: normalizeProductCategory(product.category),
  }),
)

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
 * 특정 기사와 연결된 상품 찾기 (Saint-Rémy PICK 자리용).
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