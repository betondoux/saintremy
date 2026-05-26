import { useParams, Link } from 'react-router-dom'
import {
  getArticleBySlug,
  CATEGORY_LABELS,
  type Article,
  type RoundupItem,
} from '../content/articles'
import { Dek } from '../components/Dek'
import { AdSlot } from '../components/AdSlot'
import { VideoHero } from '../components/VideoHero'
import AffiliateDisclosure from '../components/AffiliateDisclosure'
import PickCard from '../components/PickCard'
import RoundupCard from '../components/RoundupCard'
import DuelProductCard from '../components/DuelProductCard'
import { SEO } from '../components/SEO'
import BestBetCard from '../components/sidebar/BestBetCard'
import NewsletterCTA from '../components/sidebar/NewsletterCTA'
import RelatedArticles from '../components/sidebar/RelatedArticles'
import Gist from '../components/article/Gist'
import RankBadge from '../components/article/RankBadge'
import MagazineHero from '../components/article/MagazineHero'
import {
  getProductsByTrack,
  getProductById,
  type LongevityTrack,
} from '../content/longevity-products'

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

  const seoDescription = (
    article.dek ??
    article.heroQuote ??
    article.intro?.lead ??
    article.atGlance ??
    ''
  )
    .toString()
    .replace(/\s+/g, ' ')
    .trim()

  const hasSidebar = Boolean(
    article.heroProduct || (article.related && article.related.length > 0),
  )

  return (
    <article
      className={`${hasSidebar ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-6 py-10`}
    >
      <SEO
        title={article.title}
        description={
          seoDescription.length > 155
            ? `${seoDescription.slice(0, 152)}...`
            : seoDescription || article.title
        }
        image={article.ogImage ?? article.heroImage}
        path={`/a/${article.slug}`}
        type="article"
        publishedAt={article.published}
        author={article.author}
        category={
          article.categoryLabel ?? CATEGORY_LABELS[article.category]
        }
        noindex={article.category === 'archive'}
      />
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
          매거진 트랙(ritual·people·mind·gear)은 MagazineHero로 대체.
          ══════════════════════════════════════════════════════════ */}
      {!article.youtube && article.heroImage && !article.slug.match(/^(ritual|people|mind|gear|protocol|against|report)-/) && (
        <div
          className={`${hasSidebar ? 'max-w-4xl mx-auto' : ''} w-full aspect-square mb-10 overflow-hidden`}
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

      {/* 매거진 트랙 글 — Harper's Bazaar 블랙앤화이트 톤 */}
      {article.slug.match(/^(ritual|people|mind|gear|protocol|against|report)-/) && (
        <MagazineHero article={article} />
      )}

      {/* ══════════════════════════════════════════════════════════
          ARTICLE HEADER — 카테고리 / 제목 / 부제 / 메타
          매거진 트랙은 MagazineHero가 헤더 자리 차지 → 이 블록 skip.
          ══════════════════════════════════════════════════════════ */}
      {!article.slug.match(/^(ritual|people|mind|gear|protocol|against|report)-/) && (
      <header
        className={`text-left ${article.youtube ? 'mb-14' : 'mb-14 pb-10 border-b border-dotted border-ink-900/30'}`}
      >
        {article.categoryLabel ? (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.32em',
              color: article.thumbnailColor ?? 'var(--sr-muted)',
              textTransform: 'uppercase',
            }}
          >
            {article.categoryLabel}
            {article.issueNumber && <> &nbsp;·&nbsp; ISSUE {article.issueNumber}</>}
          </div>
        ) : (
          <Link
            to={`/${article.category}`}
            className="typewriter-label text-signal hover:underline"
            style={{ letterSpacing: '0.28em' }}
          >
            {CATEGORY_LABELS[article.category]}
          </Link>
        )}

        <h1 className="headline-ko text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] text-ink-900 mt-8 md:mt-10">
          {article.title}
        </h1>

        <Dek
          text={article.dek}
          className="editorial-lead mt-7 md:mt-8 max-w-xl text-ink-700"
        />

        <div className="flex items-center gap-3 mt-10 md:mt-12 typewriter text-ink-500">
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
      )}

      {/* ══════════════════════════════════════════════════════════
          AFFILIATE DISCLOSURE — 쿠팡 어필리에이트 데이터 있는 글에만 노출.
          매거진 톤 글(ritual/people/mind/gear/story 인물 프로필 등)은 숨김.
          ══════════════════════════════════════════════════════════ */}
      {(article.heroProduct ||
        (article.roundup && article.roundup.length > 0) ||
        (article.picks && article.picks.length > 0) ||
        (article.duelProducts && article.duelProducts.length > 0)) && (
        <AffiliateDisclosure />
      )}

      {/* 2-COLUMN GRID — lg 이상에서 사이드바 노출, 모바일은 자동 1-컬럼 */}
      <div
        className={
          hasSidebar
            ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-8 lg:gap-12'
            : ''
        }
      >
        <main className="min-w-0">

      {/* Pull quote */}
      {article.heroQuote && (
        <div className="my-10 px-4 md:px-10 text-center">
          <blockquote className="headline-italic text-2xl md:text-3xl text-ink-700 leading-snug">
            "{article.heroQuote}"
          </blockquote>
        </div>
      )}

      {/* THE GIST — 본문 최상단 3줄 요약 */}
      {article.gist && article.gist.length > 0 && (
        <Gist items={article.gist} />
      )}

      {/* Body — duelProducts(THE DUEL) > roundup(다중 상품 가이드) > picks(딜 레이더) > body(일반) 분기 */}
      <div className="article-body">
        {article.duelProducts && article.duelProducts.length > 0 ? (
          <DuelLayout article={article} />
        ) : article.roundup && article.roundup.length > 0 ? (
          <RoundupLayout article={article} />
        ) : article.picks && article.picks.length > 0 ? (
          <PicksLayout article={article} />
        ) : (
          <RenderBody body={article.body} />
        )}
      </div>

      {/* AD SLOT */}
      <AdSlot slot="article-body-end" format="horizontal" minHeight="100px" />

      {/* RECOMMENDED — 글 트랙에 1개 매거진 톤 상품 (저속노화 5트랙 글에만) */}
      {(['move', 'eat', 'sleep', 'mind', 'track'] as const).includes(
        article.category as LongevityTrack,
      ) && (() => {
        const products = getProductsByTrack(article.category as LongevityTrack)
        if (products.length === 0) return null
        const p = products[0]
        return (
          <aside
            className="mt-14 pt-8 border-t border-ink-900/20"
            aria-label="Recommended"
          >
            <div
              className="text-[0.6rem] uppercase tracking-[0.32em] text-ink-500 mb-4"
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
            >
              RECOMMENDED · {article.category.toUpperCase()}
            </div>
            <div className="grid md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-3 aspect-square bg-ink-900/[0.04] rounded-2xl overflow-hidden">
                <img
                  src={p.imageUrl ?? `/images/shop/${p.id}.jpg`}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  style={{ filter: 'contrast(1.03)' }}
                  loading="lazy"
                />
              </div>
              <div className="md:col-span-9">
                <div
                  className="text-[0.6rem] uppercase tracking-[0.32em] text-ink-500 mb-2"
                  style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
                >
                  {p.brand} · {p.priceLabel}
                </div>
                <h3
                  className="text-ink-900 leading-[1.2] mb-2"
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 800,
                    fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                  }}
                >
                  {p.name}
                </h3>
                <p
                  className="text-ink-700 leading-[1.55] mb-3"
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 400,
                    fontSize: '0.95rem',
                  }}
                >
                  {p.oneLine}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    to={`/shop/${article.category}`}
                    className="inline-flex items-center gap-2 rounded-full border border-ink-900 bg-transparent text-ink-900 px-5 py-2 text-[0.65rem] uppercase tracking-[0.28em] hover:bg-ink-900 hover:text-white transition-colors"
                    style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}
                  >
                    SHOP {article.category.toUpperCase()} →
                  </Link>
                  <span
                    className="text-[0.6rem] uppercase tracking-[0.28em] text-ink-400"
                    style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
                  >
                    AD · DISCLOSURE
                  </span>
                </div>
              </div>
            </div>
          </aside>
        )
      })()}

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

        </main>

        {hasSidebar && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              {article.heroProduct && (
                <BestBetCard product={article.heroProduct} />
              )}
              <NewsletterCTA />
              {article.related && article.related.length > 0 && (
                <RelatedArticles ids={article.related} />
              )}
            </div>
          </aside>
        )}
      </div>

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
// DUEL LAYOUT — THE DUEL 시리즈 (atGlance · 2 products · matrix · 7 rounds
//   · honest limits · final verdict · editor note · sources · footer)
// ═══════════════════════════════════════════════════════════════
function DuelLayout({ article }: { article: Article }) {
  const accent = article.thumbnailColor ?? '#2A1810'

  return (
    <>
      {/* AT A GLANCE */}
      {article.atGlance && (
        <section
          style={{
            margin: '40px 0',
            padding: '28px 24px',
            backgroundColor: 'var(--sr-paper)',
            borderTop: `2px solid ${accent}`,
            borderBottom: `2px solid ${accent}`,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              letterSpacing: '0.3em',
              color: accent,
              marginBottom: '12px',
            }}
          >
            AT A GLANCE
          </div>
          <p
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: '17px',
              lineHeight: 1.7,
              color: 'var(--sr-ink)',
              margin: 0,
            }}
          >
            {article.atGlance}
          </p>
        </section>
      )}

      {/* 2 제품 카드 — 데스크톱 2열, 모바일 세로 스택 */}
      {article.duelProducts && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          style={{ margin: '48px 0' }}
        >
          {article.duelProducts.map((p) => (
            <DuelProductCard
              key={p.position}
              product={p}
              accentColor={accent}
            />
          ))}
        </div>
      )}

      {/* 비교 매트릭스 테이블 */}
      {article.comparisonMatrix && article.comparisonMatrix.length > 0 && (
        <section style={{ margin: '56px 0' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: 'var(--fs-h2)',
              fontWeight: 700,
              color: 'var(--sr-ink)',
              marginBottom: '20px',
            }}
          >
            한눈에 비교
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: `2px solid ${accent}` }}>
                  <th
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-label)',
                      letterSpacing: '0.2em',
                      color: 'var(--sr-muted)',
                      textAlign: 'left',
                      padding: '12px 16px 12px 0',
                      width: '30%',
                    }}
                  >
                    항목
                  </th>
                  <th
                    style={{
                      fontFamily: 'var(--font-serif-kr)',
                      fontSize: 'var(--fs-meta)',
                      fontWeight: 700,
                      color: accent,
                      textAlign: 'left',
                      padding: '12px 16px',
                      width: '35%',
                    }}
                  >
                    A · {article.duelProducts?.[0].name}
                  </th>
                  <th
                    style={{
                      fontFamily: 'var(--font-serif-kr)',
                      fontSize: 'var(--fs-meta)',
                      fontWeight: 700,
                      color: accent,
                      textAlign: 'left',
                      padding: '12px 0 12px 16px',
                      width: '35%',
                    }}
                  >
                    B · {article.duelProducts?.[1].name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {article.comparisonMatrix.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px dashed var(--sr-rule)',
                    }}
                  >
                    <td
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--sr-muted)',
                        padding: '14px 16px 14px 0',
                        verticalAlign: 'top',
                      }}
                    >
                      {row.label}
                    </td>
                    <td
                      style={{
                        fontFamily: 'var(--font-serif-kr)',
                        fontSize: 'var(--fs-meta)',
                        color: 'var(--sr-ink)',
                        padding: '14px 16px',
                        verticalAlign: 'top',
                        lineHeight: 1.5,
                      }}
                    >
                      {row.a}
                    </td>
                    <td
                      style={{
                        fontFamily: 'var(--font-serif-kr)',
                        fontSize: 'var(--fs-meta)',
                        color: 'var(--sr-ink)',
                        padding: '14px 0 14px 16px',
                        verticalAlign: 'top',
                        lineHeight: 1.5,
                      }}
                    >
                      {row.b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 7 라운드 */}
      {article.rounds && article.rounds.length > 0 && (
        <section style={{ margin: '56px 0' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: 'var(--fs-h2)',
              fontWeight: 700,
              color: 'var(--sr-ink)',
              marginBottom: '32px',
            }}
          >
            라운드 별 평가
          </h2>
          {article.rounds.map((r) => (
            <article key={r.number} style={{ marginBottom: '40px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-label)',
                  letterSpacing: '0.3em',
                  color: accent,
                  marginBottom: '6px',
                }}
              >
                ROUND {r.number}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif-kr)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--sr-ink)',
                  marginBottom: '20px',
                }}
              >
                {r.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  style={{
                    borderLeft: `2px solid ${accent}`,
                    paddingLeft: '16px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      letterSpacing: '0.2em',
                      color: 'var(--sr-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    A
                  </div>
                  <p
                    style={{
                      fontSize: 'var(--fs-meta)',
                      lineHeight: 1.7,
                      color: 'var(--sr-ink)',
                      margin: 0,
                    }}
                  >
                    {r.a}
                  </p>
                </div>
                <div
                  style={{
                    borderLeft: `2px solid ${accent}`,
                    paddingLeft: '16px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      letterSpacing: '0.2em',
                      color: 'var(--sr-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    B
                  </div>
                  <p
                    style={{
                      fontSize: 'var(--fs-meta)',
                      lineHeight: 1.7,
                      color: 'var(--sr-ink)',
                      margin: 0,
                    }}
                  >
                    {r.b}
                  </p>
                </div>
              </div>
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--sr-paper)',
                  fontSize: 'var(--fs-meta)',
                  color: 'var(--sr-ink)',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: accent }}>판정: {r.winner}</strong>
                {r.winnerNote && (
                  <span style={{ color: 'var(--sr-muted)' }}> — {r.winnerNote}</span>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* 솔직한 한계 */}
      {article.honestLimits && (
        <section style={{ margin: '56px 0' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: 'var(--fs-h2)',
              fontWeight: 700,
              color: 'var(--sr-ink)',
              marginBottom: '20px',
            }}
          >
            솔직한 한계
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['a', 'b'] as const).map((side) => (
              <div
                key={side}
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--sr-paper)',
                  borderTop: `2px solid ${accent}`,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-label)',
                    letterSpacing: '0.2em',
                    color: accent,
                    marginBottom: '12px',
                  }}
                >
                  {side.toUpperCase()} ·{' '}
                  {article.duelProducts?.[side === 'a' ? 0 : 1].name}
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {article.honestLimits![side].map((item, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 'var(--fs-meta)',
                        lineHeight: 1.6,
                        color: 'var(--sr-ink)',
                        marginBottom: '6px',
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 최종 판정 */}
      {article.finalVerdict && (
        <section style={{ margin: '56px 0' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: 'var(--fs-h2)',
              fontWeight: 700,
              color: 'var(--sr-ink)',
              marginBottom: '20px',
            }}
          >
            최종 판정
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {(['recommendA', 'recommendB'] as const).map((key) => {
              const block = article.finalVerdict![key]
              return (
                <div
                  key={key}
                  style={{
                    padding: '24px',
                    border: `1px solid ${accent}`,
                    backgroundColor: 'var(--sr-bg)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif-kr)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: accent,
                      marginBottom: '14px',
                    }}
                  >
                    {block.title}
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {block.items.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 'var(--fs-meta)',
                          lineHeight: 1.6,
                          color: 'var(--sr-ink)',
                          marginBottom: '6px',
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          <div
            style={{
              padding: '24px',
              backgroundColor: accent,
              color: 'var(--sr-bg)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif-kr)',
                fontSize: '17px',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {article.finalVerdict.conclusion}
            </p>
          </div>
        </section>
      )}

      {/* 에디터 노트 */}
      {article.editorNote && (
        <section
          style={{
            margin: '56px 0',
            padding: '28px',
            borderTop: '1px solid var(--sr-rule)',
            borderBottom: '1px solid var(--sr-rule)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              letterSpacing: '0.3em',
              color: 'var(--sr-muted)',
              marginBottom: '12px',
            }}
          >
            EDITOR'S NOTE
          </div>
          <p
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontStyle: 'italic',
              fontSize: '17px',
              lineHeight: 1.8,
              color: 'var(--sr-ink)',
              whiteSpace: 'pre-line',
              margin: 0,
            }}
          >
            {article.editorNote}
          </p>
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
            textAlign: 'center',
          }}
        >
          {article.footer}
        </p>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// ROUNDUP LAYOUT — The Strategist "Mother's Day Gifts" 식 다중 상품 가이드
// 구조: intro(옵션) · roundup items 세로 스택 · outro(옵션) · footer
// 각 item 은 RoundupCard 가 책임 (섹션 헤드라인 + 정사각 이미지 + 가격 + CTA)
// ═══════════════════════════════════════════════════════════════
function RoundupLayout({ article }: { article: Article }) {
  if (!article.roundup) return null

  // 카운터 박스용 집계 (Strategist Mother's Day 식 "28 items, 2 sale" 패턴)
  const total = article.roundup.length
  const saleCount = article.roundup.filter((item) => item.discountLabel).length

  // 본문에 [ROUNDUP n-m] 마커가 있으면 카드를 본문 사이에 인라인 렌더 → 하단 스택 생략
  const usesInlineMarkers =
    !!article.body && /\[ROUNDUP\s/.test(article.body)

  return (
    <>
      {/* 도입부 — 글 전체 톤 잡는 lead + body */}
      {article.intro && (
        <section className="mb-10 md:mb-14">
          <p className="editorial-lead mb-7 md:mb-8">
            {article.intro.lead}
          </p>
          <p
            className="body-serif text-ink-700"
            style={{ fontSize: 'var(--fs-body)' }}
          >
            {article.intro.body}
          </p>
        </section>
      )}

      {/* 본문 — intro 와 별개로 article.body 가 있으면 본문 마크다운 렌더 후
         아래에서 카운터 박스 + roundup 카드들이 이어진다. (Chet Faker 패턴)
         단, 본문에 [ROUNDUP n-m] 마커 있으면 카드는 그 자리에 인라인으로 들어감. */}
      {article.body && article.body.trim().length > 0 && (
        <section className="mb-10 md:mb-14">
          <RenderBody body={article.body} roundup={article.roundup} />
        </section>
      )}

      {/* 인라인 마커 미사용 시에만 하단 카드 스택 노출 */}
      {!usesInlineMarkers && <hr className="dotted-rule" />}

      {/* 카운터 박스 — Strategist 톤. 인라인 마커 미사용 시만 노출 */}
      {!usesInlineMarkers && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.04)',
            border: '0.5px solid var(--sr-rule)',
            borderRadius: '8px',
            padding: '20px 24px',
            margin: '32px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display-en)',
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--sr-ink)',
                lineHeight: 1,
              }}
            >
              {total}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                letterSpacing: '0.06em',
                color: 'var(--sr-ink)',
              }}
            >
              개의 추천 상품
            </span>
          </div>
          {saleCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display-en)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#D85A30',
                  lineHeight: 1,
                }}
              >
                {saleCount}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  color: '#D85A30',
                }}
              >
                개 세일 진행 중!
              </span>
            </div>
          )}
        </div>
      )}

      {/* 상품 카드 세로 스택 — 인라인 마커 미사용 시만 */}
      {!usesInlineMarkers &&
        article.roundup.map((item, i) => (
          <RoundupCard
            key={i}
            item={item}
            isLast={i === article.roundup!.length - 1}
          />
        ))}

      {/* The Strategist 점선 구분선 — 마지막 카드 → 마무리/footer 전환 */}
      <hr className="dotted-rule" />

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
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// PICKS LAYOUT — 딜 레이더 형식 (intro · criteria · picks · outro · footer)
// ═══════════════════════════════════════════════════════════════
function PicksLayout({ article }: { article: Article }) {
  return (
    <>
      {/* 도입부 — editorial lead + body serif */}
      {article.intro && (
        <section className="mb-14 md:mb-20">
          <p className="editorial-lead mb-7 md:mb-8">
            {article.intro.lead}
          </p>
          <p
            className="body-serif text-ink-700"
            style={{ fontSize: 'var(--fs-body)' }}
          >
            {article.intro.body}
          </p>
        </section>
      )}

      {/* 선정 기준 — cream 박스 + 명조 제목 */}
      {article.criteria && (
        <section
          className="my-14 md:my-20 px-6 py-8 md:px-10 md:py-10"
          style={{ backgroundColor: 'var(--sr-paper)' }}
        >
          <div className="section-eyebrow mb-3">Selection Criteria</div>
          <h2
            style={{
              fontFamily: 'var(--font-serif-kr)',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--sr-ink)',
              marginBottom: '1.25rem',
            }}
          >
            {article.criteria.title}
          </h2>
          <ol
            className="list-decimal pl-5 space-y-3 mb-5"
            style={{
              fontSize: 'var(--fs-body)',
              color: 'var(--sr-ink)',
              lineHeight: 1.85,
              letterSpacing: '-0.015em',
            }}
          >
            {article.criteria.items.map((item, i) => (
              <li key={i} className="pl-1">{item}</li>
            ))}
          </ol>
          {article.criteria.note && (
            <p
              className="pt-4 border-t border-dashed"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--sr-muted)',
                lineHeight: 1.7,
                fontStyle: 'italic',
                borderColor: 'var(--sr-rule)',
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
function RenderBody({
  body,
  roundup,
}: {
  body: string
  roundup?: RoundupItem[]
}) {
  // 전처리: 헤딩(##/###...) 다음에 바로 콘텐츠가 붙어있으면 빈 줄 강제 삽입.
  // 이렇게 해야 헤딩과 이어지는 리스트/문단이 별개 블록으로 분리돼 제대로 렌더됨.
  const normalized = body.replace(/^(#{1,6}\s[^\n]+)\n(?!\n)/gm, '$1\n\n')
  const blocks = normalized.split(/\n\n+/)

  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null

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

        // 인라인 PRODUCT 박스 — [PRODUCT product-id]
        // 본문 섹션 사이에 상품 1개를 매거진 톤 카드로 박는다.
        if (trimmed.startsWith('[PRODUCT ') && trimmed.endsWith(']')) {
          const pid = trimmed.slice(9, -1).trim()
          const p = getProductById(pid)
          if (!p) return null
          return (
            <aside
              key={i}
              className="my-10 p-5 md:p-6 border border-ink-900/15 rounded-2xl bg-ink-900/[0.02]"
            >
              <div
                className="text-[0.6rem] uppercase tracking-[0.32em] text-ink-500 mb-4"
                style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
              >
                RECOMMENDED · 매거진 큐레이션
              </div>
              <div className="grid md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-3 aspect-square bg-ink-900/[0.04] rounded-xl overflow-hidden">
                  <img
                    src={p.imageUrl ?? `/images/shop/${p.id}.jpg`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    style={{ filter: 'contrast(1.03)' }}
                    loading="lazy"
                  />
                </div>
                <div className="md:col-span-9">
                  <div
                    className="text-[0.6rem] uppercase tracking-[0.32em] text-ink-500 mb-2"
                    style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
                  >
                    {p.brand} · {p.priceLabel}
                  </div>
                  <h3
                    className="text-ink-900 leading-[1.2] mb-2"
                    style={{
                      fontFamily: 'Pretendard, sans-serif',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                    }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="text-ink-900 leading-[1.5] mb-2"
                    style={{
                      fontFamily: 'Pretendard, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.98rem',
                    }}
                  >
                    {p.oneLine}
                  </p>
                  {p.rationale && (
                    <p
                      className="text-ink-700 leading-[1.6] mb-3 max-w-2xl"
                      style={{
                        fontFamily: 'Pretendard, sans-serif',
                        fontWeight: 400,
                        fontSize: '0.9rem',
                      }}
                    >
                      {p.rationale}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    {p.source && (
                      <span
                        className="text-[0.6rem] uppercase tracking-[0.28em] text-ink-500"
                        style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
                      >
                        → {p.source}
                      </span>
                    )}
                    {p.purchaseUrl && p.purchaseUrl !== '#' ? (
                      <a
                        href={p.purchaseUrl}
                        target="_blank"
                        rel="noopener sponsored nofollow"
                        className="inline-flex items-center gap-2 rounded-full border border-ink-900 bg-transparent text-ink-900 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.28em] hover:bg-ink-900 hover:text-white transition-colors"
                        style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}
                      >
                        구매 →
                      </a>
                    ) : (
                      <span
                        className="text-[0.6rem] uppercase tracking-[0.28em] text-ink-400"
                        style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
                      >
                        구매 링크 준비 중 · AD · DISCLOSURE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </aside>
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

        // RankBadge 마커 — [BADGE variant] 또는 [BADGE variant | 라벨 오버라이드]
        if (trimmed.startsWith('[BADGE ')) {
          const inner = trimmed.slice(7, -1).trim()
          const [variantRaw, labelOverride] = inner
            .split('|')
            .map((s) => s.trim())
          const variant = variantRaw as
            | 'overall'
            | 'budget'
            | 'splurge'
            | 'for'
            | 'also'
            | 'editor'
          return (
            <div key={i} className="mt-10">
              <RankBadge variant={variant} label={labelOverride || undefined} />
            </div>
          )
        }

        // [ROUNDUP n-m] — 본문 사이 인라인 RoundupCard 페어 (1-indexed)
        // 예: [ROUNDUP 1-2] → roundup[0..1] 두 개를 그 자리에 카드로 렌더
        if (trimmed.startsWith('[ROUNDUP ') && trimmed.endsWith(']')) {
          if (!roundup || roundup.length === 0) return null
          const range = trimmed.slice(9, -1).trim()
          const [startStr, endStr] = range.split('-').map((s) => s.trim())
          const start = Math.max(0, parseInt(startStr, 10) - 1)
          const end = (endStr ? parseInt(endStr, 10) : parseInt(startStr, 10)) - 1
          if (Number.isNaN(start) || Number.isNaN(end)) return null
          const items = roundup.slice(start, Math.min(end + 1, roundup.length))
          if (items.length === 0) return null
          return (
            <div key={i} className="my-10">
              {items.map((item, j) => (
                <RoundupCard
                  key={`inline-${i}-${j}`}
                  item={item}
                  isLast={j === items.length - 1}
                />
              ))}
            </div>
          )
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

        // 불릿 리스트 — `•` (Notion), `-` / `*` (표준 마크다운) 모두 지원
        if (/^[•\-*]\s/.test(trimmed)) {
          const items = trimmed
            .split('\n')
            .filter((l) => /^[•\-*]\s/.test(l.trim()))
            .map((l) => l.trim().replace(/^[•\-*]\s+/, ''))
          if (items.length > 0) {
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