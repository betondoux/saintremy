import React from 'react'
import { PromoSlot } from './PromoSlot'

interface ArticleListWithDividersProps<T> {
  articles: T[]
  renderCard: (article: T, index: number) => React.ReactNode
  getKey: (article: T, index: number) => string
  slotEvery?: number
}

/**
 * 글 카드 사이에 점선(.dotted-rule) 자동 삽입 + N개마다 PromoSlot 삽입.
 * The Strategist 패턴.
 *
 * 예) slotEvery=2, 글 5개:
 *   [card 1] hr [card 2] hr [SLOT] hr [card 3] hr [card 4] hr [SLOT] hr [card 5]
 */
export function ArticleListWithDividers<T>({
  articles,
  renderCard,
  getKey,
  slotEvery = 2,
}: ArticleListWithDividersProps<T>) {
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
