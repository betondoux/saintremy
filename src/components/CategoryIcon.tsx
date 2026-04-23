// src/components/CategoryIcon.tsx
// NYT Wirecutter 풍 라인 드로잉 카테고리 아이콘.
// 실제 SVG 파일은 /public/icons/categories/{slug}.svg 에 추후 배치.
// 파일이 없으면 onError로 숨김 처리 — 안전한 플레이스홀더.

import type { Category } from '../content/articles'

type Props = {
  category: Category
  size?: number
}

export default function CategoryIcon({ category, size = 40 }: Props) {
  const src = `/icons/categories/${category}.svg`
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      style={{ opacity: 0.7 }}
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
