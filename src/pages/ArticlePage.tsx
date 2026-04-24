import { useParams, Link } from 'react-router-dom'
import {
  getArticleBySlug,
  CATEGORY_LABELS,
  type Article,
} from '../content/articles'
import { Dek } from '../components/Dek'
import { AdSlot } from '../components/AdSlot'
import { VideoHero } from '../components/VideoHero'
import { NewsletterInline } from '../components/NewsletterInline'
import AffiliateDisclosure from '../components/AffiliateDisclosure'
import PickCard from '../components/PickCard'

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug ? getArticleBySlug(slug) : undefined

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="typewriter-label text-ink-500 mb-4">— 404</div>
        <div className="headline text-3xl text-ink-900 mb-6">
          기사를 찾을 수 없습니다
        </div>
        <Link
          to="/"
          className="typewriter-label text-signal hover:underline"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-10">
      {/* ══════════════════════════════════════════════════════════
          VIDEO HERO — 영상 있으면 최상단 우선 배치
          ══════════════════════════════════════════════════════════ */}
      {article.youtube && (
        <VideoHero
          youtubeId={article.youtube}
          title={article.title}
          readTime={article.readTime}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          HERO IMAGE — 에디토리얼 오프닝 (영상 없고 heroImage 있을 때)
          ══════════════════════════════════════════════════════════ */}
      {!article.youtube && article.heroImage && (
        <div
          className="w-full aspect-square mb-10 overflow-hidden"
          style={{ backgroundColor: article.thumbnailColor ?? 'var(--sr-paper)' }}
        >
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          AFFILIATE DISCLOSURE — 쿠팡 파트너스 대가성 문구 (제목 위)
          ══════════════════════════════════════════════════════════ */}
      <AffiliateDisclosure />

      {/* ══════════════════════════════════════════════════════════
          ARTICLE HEADER — 카테고리 / 제목 / 부제 / 메타
          ══════════════════════════════════════════════════════════ */}
      <header
        className={`text-center ${article.youtube ? 'mb-10' : 'mb-10 pb-8 border-b border-dashed border-ink-900/25'}`}
      >
        <Link
          to={`/${article.category}`}
          className="typewriter-label text-signal hover:underline"
        >
          {CATEGORY_LABELS[article.category]}
        </Link>

        <h1 className="headline-ko text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] text-ink-900 mt-5 leading-tight">
          {article.title}
        </h1>

        <Dek
          text={article.dek}
          className="body-text text-ink-500 text-base md:text-lg mt-5 leading-relaxed max-w-2xl mx-auto"
        />

        <div className="flex items-center justify-center gap-3 mt-6 typewriter text-ink-500">
          <span>{article.author}</span>
          <span className="opacity-40">·</span>
          <span>{formatDate(article.published)}</span>
          {!article.youtube && (
            <>
              <span className="opacity-40">·</span>
              <span>{article.readTime}분 읽기</span>
            </>
          )}
        </div>
      </header>

      {/* Pull quote */}
      {article.heroQuote && (
        <div className="my-10 px-4 md:px-10 text-center">
          <blockquote className="headline-italic text-2xl md:text-3xl text-ink-700 leading-snug">
            "{article.heroQuote}"
          </blockquote>
        </div>
      )}

      {/* Body — picks 있으면 PickCard 레이아웃, 없으면 마크다운 본문 */}
      <div className="article-body">
        {article.picks && article.picks.length > 0 ? (
          <PicksLayout article={article} />
        ) : (
          <RenderBody body={article.body} />
        )}
      </div>

      {/* AD SLOT */}
      <AdSlot slot="article-body-end" format="horizontal" minHeight="100px" />

      {/* Sources */}
      {article.sources && article.sources.length > 0 && (
        <section className="mt-14 pt-8 border-t border-dashed border-ink-900/25">
          <div className="typewriter-label text-ink-900 mb-4">
            — 출처 및 참고 문헌
          </div>
          <ol className="space-y-4">
            {article.sources.map((source, i) => (
              <li
                key={i}
                className="typewriter text-sm text-ink-500 leading-relaxed"
              >
                <span className="text-ink-900 font-medium">[{i + 1}]</span>{' '}
                {source.author && <span>{source.author}. </span>}
                <span className="text-ink-900">{source.title}</span>
                {source.publisher && <span>, {source.publisher}</span>}
                {source.year && <span>, {source.year}</span>}
                {source.url && (
                  <>
                    {' · '}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-signal hover:underline break-all"
                    >
                      {source.url}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-14 pt-8 border-t-2 border-ink-900 text-center">
        <Link
          to="/"
          className="typewriter-label text-signal hover:underline"
        >
          ← 다른 글 보기
        </Link>
      </div>
    </article>
  )
}

// ═══════════════════════════════════════════════════════════════
// PICKS LAYOUT — 딜 레이더 형식 (intro · criteria · picks · outro · footer)
// ═══════════════════════════════════════════════════════════════
function PicksLayout({ article }: { article: Article }) {
  const dealColor = 'var(--cat-deal)'

  return (
    <>
      {/* 어필리에이트 고지 박스 (본문 최상단) */}
      {article.affiliateDisclosure && (
        <div
          style={{
            borderLeft: `4px solid ${dealColor}`,
            backgroundColor: 'var(--sr-paper)',
            padding: '16px 20px',
            margin: '24px 0',
            fontSize: '14px',
            fontStyle: 'italic',
            color: 'var(--sr-muted)',
            lineHeight: 1.6,
          }}
        >
          {article.affiliateDisclosure}
        </div>
      )}

      {/* 도입부 */}
      {article.intro && (
        <>
          <p
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: '24px',
              lineHeight: 1.5,
              color: 'var(--sr-ink)',
              marginBottom: '16px',
            }}
          >
            {article.intro.lead}
          </p>
          <p
            style={{
              fontSize: 'var(--fs-body)',
              lineHeight: 1.7,
              color: 'var(--sr-ink)',
              marginBottom: '32px',
            }}
          >
            {article.intro.body}
          </p>
        </>
      )}

      {/* 선정 기준 */}
      {article.criteria && (
        <section className="my-12">
          <h2
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: 'var(--fs-h2)',
              fontWeight: 700,
              color: 'var(--sr-ink)',
              marginBottom: '16px',
            }}
          >
            {article.criteria.title}
          </h2>
          <ul
            className="list-disc pl-6 space-y-2 mb-4"
            style={{
              fontSize: 'var(--fs-body)',
              color: 'var(--sr-ink)',
              lineHeight: 1.6,
            }}
          >
            {article.criteria.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          {article.criteria.note && (
            <p
              style={{
                fontSize: 'var(--fs-meta)',
                color: 'var(--sr-muted)',
                lineHeight: 1.6,
              }}
            >
              {article.criteria.note}
            </p>
          )}
        </section>
      )}

      {/* Pick 카드들 */}
      {article.picks?.map((pick) => (
        <PickCard key={pick.rank} pick={pick} />
      ))}

      {/* 마무리 */}
      {article.outro && (
        <section
          className="my-12 pt-8"
          style={{ borderTop: '1px solid var(--sr-rule)' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: 'var(--fs-h2)',
              fontWeight: 700,
              color: 'var(--sr-ink)',
              marginBottom: '16px',
            }}
          >
            {article.outro.title}
          </h2>
          <p
            style={{
              fontSize: 'var(--fs-body)',
              color: 'var(--sr-ink)',
              lineHeight: 1.7,
              marginBottom: '16px',
            }}
          >
            {article.outro.body}
          </p>
          {article.outro.nextIssue && (
            <p
              style={{
                fontSize: 'var(--fs-meta)',
                fontStyle: 'italic',
                color: 'var(--sr-muted)',
              }}
            >
              {article.outro.nextIssue}
            </p>
          )}
        </section>
      )}

      {/* 푸터 라인 */}
      {article.footer && (
        <p
          style={{
            fontSize: '12px',
            fontStyle: 'italic',
            color: 'var(--sr-muted)',
            marginTop: '32px',
          }}
        >
          {article.footer}
        </p>
      )}
      {/* 뉴스레터는 Footer 에서 전역 렌더 */}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// 본문 렌더러 — Notion-식 마크다운 + 임베드 지원
// ═══════════════════════════════════════════════════════════════
function RenderBody({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/)
  const inlineInsertIndex = Math.floor((blocks.filter((b) => b.trim()).length * 2) / 3)
  let visibleBlockCount = 0

  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null
        visibleBlockCount++

        const shouldInsertNewsletter = visibleBlockCount === inlineInsertIndex

        // YouTube 임베드
        if (trimmed.startsWith('[YOUTUBE] ')) {
          const videoId = trimmed.replace('[YOUTUBE] ', '').trim()
          return (
            <div key={i} className="my-8">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video"
                />
              </div>
            </div>
          )
        }

        // 이미지
        if (trimmed.startsWith('[IMAGE] ')) {
          const rest = trimmed.replace('[IMAGE] ', '')
          const [url, caption] = rest.split(' | ').map((s) => s.trim())
          return (
            <figure key={i} className="my-8">
              <img
                src={url}
                alt={caption ?? ''}
                className="w-full h-auto"
                loading="lazy"
              />
              {caption && (
                <figcaption className="typewriter text-xs text-ink-500 mt-2 text-center">
                  {caption}
                </figcaption>
              )}
            </figure>
          )
        }

        // 외부 임베드
        if (trimmed.startsWith('[EMBED] ')) {
          const url = trimmed.replace('[EMBED] ', '').trim()
          return (
            <div
              key={i}
              className="my-8 p-4 border border-ink-900/20 bg-cream-200/50"
            >
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="typewriter text-sm text-signal hover:underline break-all"
              >
                🔗 {url}
              </a>
            </div>
          )
        }

        // 구분선
        if (trimmed === '---') {
          return <hr key={i} className="my-8 border-dashed border-ink-900/30" />
        }

        // H2 제목
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={i}
              className="headline text-2xl md:text-3xl text-ink-900 mt-12 mb-5 leading-tight"
            >
              {trimmed.slice(3)}
            </h2>
          )
        }

        // H3 제목
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={i}
              className="headline text-xl md:text-2xl text-ink-900 mt-10 mb-4 leading-tight"
            >
              {trimmed.slice(4)}
            </h3>
          )
        }

        // 인용
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="my-6 pl-5 border-l-2 border-signal italic text-ink-700 text-base md:text-lg leading-relaxed"
            >
              {trimmed.slice(2)}
            </blockquote>
          )
        }

        // 순번 리스트
        if (/^\d+\.\s/.test(trimmed) && trimmed.includes('\n')) {
          const items = trimmed
            .split('\n')
            .filter((l) => /^\d+\.\s/.test(l.trim()))
            .map((l) => l.trim().replace(/^\d+\.\s*/, ''))
          return (
            <ol key={i} className="list-decimal pl-6 my-6 space-y-2">
              {items.map((item, j) => (
                <li
                  key={j}
                  className="body-text text-ink-900 text-base md:text-lg pl-2"
                >
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          )
        }

        // 마크다운 테이블 — `| col | col |` + `|---|---|` 구분행 + 바디 행
        if (trimmed.startsWith('|') && trimmed.includes('\n|')) {
          const lines = trimmed.split('\n').map((l) => l.trim())
          const sepLine = lines[1]
          const isTable =
            sepLine &&
            /^\|[\s:|-]+\|$/.test(sepLine) &&
            sepLine.includes('---')
          if (isTable) {
            const parseCells = (line: string) =>
              line
                .replace(/^\||\|$/g, '')
                .split('|')
                .map((c) => c.trim())
            const headers = parseCells(lines[0])
            const rows = lines.slice(2).filter(Boolean).map(parseCells)
            return (
              <div key={i} className="my-8 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-ink-900">
                      {headers.map((h, j) => (
                        <th
                          key={j}
                          className="typewriter-label text-ink-900 text-xs py-3 pr-4 text-left align-bottom"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, j) => (
                      <tr
                        key={j}
                        className="border-b border-dashed border-ink-900/20"
                      >
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="body-text text-ink-900 text-sm md:text-base py-3 pr-4 align-top leading-snug"
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        }

        // 불릿 리스트
        if (/^•\s/.test(trimmed) && trimmed.includes('\n')) {
          const items = trimmed
            .split('\n')
            .filter((l) => /^•\s/.test(l.trim()))
            .map((l) => l.trim().slice(2))
          return (
            <ul key={i} className="list-disc pl-6 my-6 space-y-2">
              {items.map((item, j) => (
                <li
                  key={j}
                  className="body-text text-ink-900 text-base md:text-lg pl-2"
                >
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          )
        }

        // 코드 블록
        if (trimmed.startsWith('```')) {
          const code = trimmed.replace(/^```\n?/, '').replace(/```$/, '')
          return (
            <pre
              key={i}
              className="my-6 p-4 bg-ink-900 text-cream-100 typewriter text-sm overflow-x-auto"
            >
              <code>{code}</code>
            </pre>
          )
        }

        // 일반 문단
        return (
          <div key={i}>
            <p className="body-text text-ink-900 text-base md:text-lg leading-[1.75] my-5">
              {renderInline(trimmed)}
            </p>
            {shouldInsertNewsletter && <NewsletterInline />}
          </div>
        )
      })}
    </>
  )
}

function renderInline(text: string): React.ReactNode {
  // 순서: 링크 [text](url) 먼저 — 내부에 **/*/` 포함될 수 있으니 가장 먼저 매칭.
  // ~~취소선~~ 은 **bold** 보다 먼저 (둘 다 연속 문자 2개라 겹침 가능).
  const parts = text.split(
    /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*|`[^`]+`)/g,
  )
  return parts.map((part, i) => {
    // 마크다운 링크 [text](url) — 어필리에이트 CTA 용도
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      const [, label, url] = linkMatch
      const external = /^https?:\/\//.test(url)
      return (
        <a
          key={i}
          href={url}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener sponsored nofollow' : undefined}
          className="text-signal underline decoration-signal/40 underline-offset-4 hover:text-ink-900 hover:decoration-ink-900 transition"
        >
          {label}
        </a>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return (
        <s key={i} className="text-ink-400">
          {part.slice(2, -2)}
        </s>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="typewriter text-sm bg-cream-200 px-1.5 py-0.5"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}