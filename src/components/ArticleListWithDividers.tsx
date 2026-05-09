import React from 'react'
import { PromoSlot } from './PromoSlot'

interface ArticleListWithDividersProps<T> {
  articles: T[]
  renderCard: (article: T, index: number) => React.ReactNode
  getKey: (article: T, index: number) => string
  slotEvery?: number
  /**
   * 'list' (기본) — Strategist vertical + dotted divider + PromoSlot
   * 'grid'        — 디에딧 4-column responsive grid (모바일 1, md 2, lg 4)
   *                 divider 제거, PromoSlot은 grid item 1칸 차지
   */
  mode?: 'list' | 'grid'
}

/**
 * 글 카드 리스트 — list 또는 grid 모드.
 *
 * list 모드 (기본):
 *   글 카드 사이에 점선(.dotted-rule) 자동 삽입 + N개마다 PromoSlot 삽입.
 *   예) slotEvery=2, 글 5개:
 *     [card 1] hr [card 2] hr [SLOT] hr [card 3] hr [card 4] hr [SLOT] hr [card 5]
 *
 * grid 모드:
 *   responsive grid (1·2·4 cols) — divider 없음. PromoSlot은 grid item 1칸 차지.
 *   예) slotEvery=2, 글 5개:
 *     [card 1] [card 2] [SLOT] [card 3] [card 4] [SLOT] [card 5]
 */
export function ArticleListWithDividers<T>({
  articles,
  renderCard,
  getKey,
  slotEvery = 2,
  mode = 'list',
}: ArticleListWithDividersProps<T>) {
  if (mode === 'grid') {
    const items: React.ReactNode[] = []
    articles.forEach((article, i) => {
      const key = getKey(article, i)
      items.push(
        <React.Fragment key={`card-${key}`}>{renderCard(article, i)}</React.Fragment>,
      )
      const isLast = i === articles.length - 1
      const isSlotPosition = (i + 1) % slotEvery === 0
      if (isSlotPosition && !isLast) {
        items.push(<PromoSlot key={`slot-${key}`} kind="placeholder" />)
      }
    })
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {items}
      </div>
    )
  }

  // mode === 'list' — 기존 동작 100% 유지
  const items: React.ReactNode[] = []

  articles.forEach((article, i) => {
    const key = getKey(article, i)

    // 글 카드
    items.push(
      <React.Fragment key={`card-${key}`}>
        {renderCard(article, i)}
      </React.Fragment>,
    )

    const isLast = i === articles.length - 1
    if (isLast) return

    // 점선
    items.push(<hr key={`hr-${key}`} className="dotted-rule" />)

    // 슬롯 삽입 시점 (마지막 글 직전엔 슬롯/추가 hr 안 넣음)
    const isSlotPosition = (i + 1) % slotEvery === 0
    if (isSlotPosition) {
      items.push(<PromoSlot key={`slot-${key}`} kind="placeholder" />)
      items.push(<hr key={`hr-after-slot-${key}`} className="dotted-rule" />)
    }
  })

  return <>{items}</>
}
