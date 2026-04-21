import { splitDekIntoSentences } from '../content/articles'

interface Props {
  text: string
  className?: string
  /** 문장 간 간격 (px or rem). 기본 '0.3em' */
  spacing?: string
}

/**
 * Dek (부제) 컴포넌트.
 *
 * 에디토리얼 매거진 스타일로, 마침표 뒤의 각 문장을
 * 독립된 줄(블록)로 렌더링합니다.
 *
 * The Strategist, NYT Magazine 스타일:
 *   한 문장이 끝나면 다음 문장은 새 줄에서 시작하여
 *   각 진술이 무게를 갖도록 합니다.
 */
export function Dek({ text, className = '', spacing = '0.3em' }: Props) {
  const sentences = splitDekIntoSentences(text)

  if (sentences.length === 0) return null

  // 한 문장이면 평범한 p 태그
  if (sentences.length === 1) {
    return <p className={className}>{sentences[0]}</p>
  }

  // 여러 문장이면 각 문장을 div로 분리
  return (
    <div className={className}>
      {sentences.map((sentence, i) => (
        <div
          key={i}
          style={{ marginTop: i === 0 ? 0 : spacing }}
        >
          {sentence}
        </div>
      ))}
    </div>
  )
}
