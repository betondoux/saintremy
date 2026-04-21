import { useParams, Link } from 'react-router-dom'
import { getArticleBySlug, CATEGORY_LABELS } from '../content/articles'
import { Dek } from '../components/Dek'
import { AdSlot } from '../components/AdSlot'
import { VideoHero } from '../components/VideoHero'
import { NewsletterInline } from '../components/NewsletterInline'

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
          VIDEO HERO — 영상 있으면 최상단 우선 배치 (Watch + Read UX)
          ══════════════════════════════════════════════════════════ */}
      {article.youtube && (
        <VideoHero
          youtubeId={article.youtube}
          title={article.title}
          readTime={article.readTime}
        />
      )}

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

        <h1 className="headline-ko text-4xl md:text-5xl lg:text-6xl text-ink-900 mt-5 leading-tight">
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

      {/* Body */}
      <div className="article-body">
        <RenderBody body={article.body} />
      </div>

      {/* AD SLOT: 본문 끝 → 출처 사이 */}
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
// 본문 렌더러 — Notion-식 마크다운 + 임베드 지원
// ═══════════════════════════════════════════════════════════════
function RenderBody({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/)
  // 본문 2/3 지점 계산 (뉴스레터 삽입 위치)
  const inlineInsertIndex = Math.floor((blocks.filter((b) => b.trim()).length * 2) / 3)
  let visibleBlockCount = 0

  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null
        visibleBlockCount++

        // 2/3 지점에 뉴스레터 삽입
        const shouldInsertNewsletter = visibleBlockCount === inlineInsertIndex

        // ── YouTube 임베드 ([YOUTUBE] videoId)
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

        // ── 이미지 ([IMAGE] url | caption)
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

        // ── 외부 임베드 ([EMBED] url)
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

        // ── 구분선
        if (trimmed === '---') {
          return <hr key={i} className="my-8 border-dashed border-ink-900/30" />
        }

        // ── H2 제목
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

        // ── H3 제목
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

        // ── 인용 (> 또는 Notion callout)
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

        // ── 순번 리스트 (연속된 "1. " 라인들)
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

        // ── 불릿 리스트
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

        // ── 코드 블록
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

        // ── 일반 문단
        return (
          <>
            <p
              key={i}
              className="body-text text-ink-900 text-base md:text-lg leading-[1.75] my-5"
            >
              {renderInline(trimmed)}
            </p>
            {shouldInsertNewsletter && <NewsletterInline key={`nl-${i}`} />}
          </>
        )
      })}
    </>
  )
}

function renderInline(text: string): React.ReactNode {
  // **볼드**, *이탤릭*, `코드` 처리
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-ink-900">
          {part.slice(2, -2)}
        </strong>
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
