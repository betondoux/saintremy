import { Link } from 'react-router-dom'
import { NewsletterInline } from '../components/NewsletterInline'
import CategoryLabel, {
  CATEGORY_COLORS,
} from '../components/CategoryLabel'
import CategoryIcon from '../components/CategoryIcon'
import Ornament from '../components/Ornament'
import {
  getAllArticles,
  getHeroArticle,
  getArticlesByCategory,
  getMostReadArticles,
  ALL_CATEGORIES,
  CATEGORY_META,
  type Article,
  type Category,
} from '../content/articles'

// ═══════════════════════════════════════════════════════════════
// 섹션 순서 (spec 2026-04-24)
// gift, deal, [❦], style, beauty, space, [✦],
// kitchen, move, travel, [❧], furniture, living
// ═══════════════════════════════════════════════════════════════
const ORNAMENT_AFTER: Record<number, '❦' | '✦' | '❧'> = {
  1: '❦', // deal 뒤
  4: '✦', // space 뒤
  7: '❧', // travel 뒤
}

export function Home() {
  const allArticles = getAllArticles()

  // 발행 전 상태 — 샘플 데이터 노출 금지
  if (allArticles.length === 0) {
    return <PreLaunchHero />
  }

  const hero = getHeroArticle()
  const mostRead = getMostReadArticles()

  return (
    <>
      <AffiliateNotice />

      {hero && <HeroBlock article={hero} />}

      <div className="max-w-6xl mx-auto px-6">
        {ALL_CATEGORIES.map((cat, i) => (
          <div key={cat}>
            <CategorySection category={cat} excludeSlug={hero?.slug} />
            {ORNAMENT_AFTER[i] && <Ornament symbol={ORNAMENT_AFTER[i]} />}
          </div>
        ))}
      </div>

      {allArticles.length >= 5 && mostRead.length > 0 && (
        <MostReadSection articles={mostRead} />
      )}
      {/* 뉴스레터는 Footer 에서 전역 렌더 — 페이지 레벨 중복 방지 */}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// PRE-LAUNCH HERO — 기사 0편 상태의 커밍순 화면
// ═══════════════════════════════════════════════════════════════
function PreLaunchHero() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 md:pt-28 pb-24 text-center">
      <div
        className="masthead text-ink-900 text-6xl md:text-7xl lg:text-8xl leading-[0.9]"
      >
        Saint-Rémy
      </div>

      <p className="headline-ko text-ink-900 text-2xl md:text-3xl mt-8 leading-snug">
        평범한 사물을 깊이 보는 매거진
      </p>

      <div className="mt-14 pt-10 border-t border-dashed border-ink-900/25">
        <div className="typewriter-label text-signal mb-3">
          — EDITORS ARE WORKING ON ISSUE 001
        </div>
        <p className="body-text text-ink-500 text-base md:text-lg">
          첫 번째 발행이 곧 공개됩니다.
        </p>
      </div>

      <NewsletterInline />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// AFFILIATE NOTICE — 홈 상단 3줄 고지
// ═══════════════════════════════════════════════════════════════
function AffiliateNotice() {
  return (
    <div
      className="py-4 px-4 text-center border-y"
      style={{ borderColor: 'var(--sr-rule)' }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          letterSpacing: '0.2em',
          color: 'var(--sr-muted)',
          marginBottom: '8px',
        }}
      >
        AFFILIATE · DISCLOSURE
      </div>
      <p
        style={{
          fontFamily: 'var(--font-serif-kr)',
          fontStyle: 'italic',
          fontSize: '14px',
          color: 'var(--sr-muted)',
          lineHeight: 1.6,
        }}
      >
        Saint-Rémy Editors가 독립적으로 선정한 제품입니다.
        <br />
        링크를 통한 구매 시 일정 수수료를 제공받을 수 있습니다.
        <Link
          to="/terms"
          className="underline ml-1"
          style={{ color: 'var(--sr-muted)' }}
        >
          자세히 →
        </Link>
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HERO BLOCK — THIS WEEK'S FEATURE
// ═══════════════════════════════════════════════════════════════
function HeroBlock({ article }: { article: Article }) {
  // 제목 끝에 숫자가 있으면 분리해서 italic 처리 ("선크림 BEST 5" → "5" italic)
  const titleMatch = article.title.match(/^(.+?)\s+(\d+)\s*$/)
  const mainTitle = titleMatch ? titleMatch[1] : article.title
  const italicNum = titleMatch ? titleMatch[2] : null

  return (
    <section className="max-w-3xl mx-auto px-6 py-8">
      <article>
        <Link to={`/a/${article.slug}`} className="block group">
          {/* 제품 실사 이미지 (정사각형) */}
          <div
            className="aspect-square w-full relative overflow-hidden"
            style={{ backgroundColor: article.thumbnailColor ?? 'var(--sr-paper)' }}
          >
            {article.heroImage && (
              <img
                src={article.heroImage}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
          </div>

          <div className="pt-8 text-center">
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                letterSpacing: '0.3em',
                color: 'var(--sr-muted)',
                marginBottom: '16px',
              }}
            >
              — THIS WEEK'S FEATURE —
            </div>

            <div className="flex justify-center mb-6">
              <CategoryLabel category={article.category} align="center" />
            </div>

            <h1
              className="mt-2"
              style={{
                fontFamily: 'var(--font-serif-kr)',
                fontSize: 'var(--fs-h1)',
                fontWeight: 700,
                lineHeight: 1.15,
                color: 'var(--sr-ink)',
              }}
            >
              {mainTitle}
              {italicNum && (
                <>
                  {' '}
                  <em
                    style={{
                      fontFamily: 'var(--font-display-en)',
                      fontStyle: 'italic',
                      fontSize: '1.4em',
                    }}
                  >
                    {italicNum}
                  </em>
                </>
              )}
            </h1>

            <p
              className="mt-4"
              style={{
                fontSize: 'var(--fs-h2)',
                color: 'var(--sr-muted)',
                lineHeight: 1.4,
              }}
            >
              {article.dek}
            </p>

            <div
              className="mt-5 flex gap-3 justify-center"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-meta)',
                color: 'var(--sr-muted)',
              }}
            >
              <span>{formatDate(article.published)}</span>
              <span>·</span>
              <span>{article.readTime}분 읽기</span>
              <span>·</span>
              <span>{article.author}</span>
            </div>
          </div>
        </Link>
      </article>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY SECTION — 카테고리별 제목 + 2px 라인 + 기사 또는 COMING SOON
// ═══════════════════════════════════════════════════════════════
function CategorySection({
  category,
  excludeSlug,
}: {
  category: Category
  excludeSlug?: string
}) {
  const meta = CATEGORY_META[category]
  const articles = getArticlesByCategory(category).filter(
    (a) => a.slug !== excludeSlug,
  )
  const hasArticles = articles.length > 0
  const color = CATEGORY_COLORS[category]

  return (
    <section className="py-16">
      <div className="flex items-end justify-between mb-6">
        {/* 아이콘 + 제목을 묶고 카테고리 컬러 상속 — CategoryIcon 은 currentColor 사용 */}
        <div
          className="flex items-center gap-3 md:gap-4"
          style={{ color }}
        >
          <CategoryIcon category={category} size={32} />
          <div style={{ color: 'var(--sr-ink)' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif-kr)',
                fontSize: 'var(--fs-h1)',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {meta.title}
            </h2>
            <p
              className="mt-1"
              style={{
                fontSize: 'var(--fs-meta)',
                color: 'var(--sr-muted)',
              }}
            >
              {meta.subtitle}
            </p>
          </div>
        </div>
        <Link
          to={`/${category}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.2em',
            color: 'var(--sr-muted)',
          }}
          className="hover:opacity-70 transition whitespace-nowrap"
        >
          VIEW ALL →
        </Link>
      </div>

      {/* 카테고리별 2px 컬러 라인 */}
      <div
        style={{
          height: 'var(--rule-accent)',
          backgroundColor: color,
          marginBottom: '32px',
        }}
      />

      {hasArticles ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {articles.slice(0, 2).map((a) => (
            <CategoryArticleCard key={a.slug} article={a} />
          ))}
        </div>
      ) : (
        <div
          className="py-12 text-center"
          style={{ color: 'var(--sr-muted)' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              letterSpacing: '0.3em',
            }}
          >
            — COMING SOON —
          </div>
          <div style={{ marginTop: '8px', fontSize: 'var(--fs-meta)' }}>
            {meta.title} 기사가 곧 공개됩니다
          </div>
        </div>
      )}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY ARTICLE CARD — 섹션 안 개별 기사 카드
// ═══════════════════════════════════════════════════════════════
function CategoryArticleCard({ article }: { article: Article }) {
  return (
    <Link to={`/a/${article.slug}`} className="block group">
      <div
        className="aspect-[4/3] w-full overflow-hidden mb-4"
        style={{ backgroundColor: article.thumbnailColor ?? 'var(--sr-paper)' }}
      >
        {article.heroImage && (
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-serif-kr)',
          fontSize: 'var(--fs-h2)',
          fontWeight: 700,
          lineHeight: 1.3,
          color: 'var(--sr-ink)',
        }}
        className="group-hover:opacity-70 transition"
      >
        {article.title}
      </h3>
      <p
        className="mt-2"
        style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--sr-muted)',
          lineHeight: 1.5,
        }}
      >
        {article.dek}
      </p>
      <div
        className="mt-3"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-meta)',
          color: 'var(--sr-muted)',
        }}
      >
        {formatDate(article.published)} · {article.readTime}분
      </div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════
// MOST READ — 기사 5개 이상일 때만 노출
// ═══════════════════════════════════════════════════════════════
function MostReadSection({ articles }: { articles: Article[] }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div
        className="mb-6"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          letterSpacing: '0.3em',
          color: 'var(--sr-muted)',
          textAlign: 'center',
        }}
      >
        — MOST READ —
      </div>
      <ol className="space-y-5">
        {articles.map((article, i) => (
          <li key={article.slug}>
            <Link
              to={`/a/${article.slug}`}
              className="group flex gap-4 items-start"
            >
              <span
                style={{
                  fontFamily: 'var(--font-display-en)',
                  fontStyle: 'italic',
                  fontSize: '36px',
                  color: CATEGORY_COLORS[article.category],
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4
                  style={{
                    fontFamily: 'var(--font-serif-kr)',
                    fontSize: 'var(--fs-h2)',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: 'var(--sr-ink)',
                  }}
                  className="group-hover:opacity-70 transition"
                >
                  {article.title}
                </h4>
                <p
                  className="mt-1"
                  style={{
                    fontSize: 'var(--fs-meta)',
                    color: 'var(--sr-muted)',
                  }}
                >
                  {article.dek}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function formatDate(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}
