// src/components/CategoryIcon.tsx
// NYT Wirecutter 풍 라인 드로잉 카테고리 아이콘.
// SVG 파일: /public/icons/categories/{slug}.svg
//
// 색상 이슈 해결: <img> 로 로드하면 currentColor 가 상속 안 되므로
// CSS mask-image 로 렌더. 부모 div의 color: var(--cat-*) 이
// background-color: currentColor → 아이콘 색상으로 자동 반영.

import type { Category } from '../content/articles'

type Props = {
  category: Category
  size?: number
}

export default function CategoryIcon({ category, size = 40 }: Props) {
  const url = `url(/icons/categories/${category}.svg)`
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: url,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: url,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        flexShrink: 0,
      }}
    />
  )
}
