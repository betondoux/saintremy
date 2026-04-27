import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import logoUrl from '../assets/saintremy-logo.png'
import CategoryLabel, {
  CATEGORY_COLORS,
} from '../components/CategoryLabel'
import CategoryIcon from '../components/CategoryIcon'
import Ornament from '../components/Ornament'
import {
  getAllArticles,
  getHeroArticle,
  getEditorsPick,
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
    return (
      <>
        <SEO path="/" />
        <PreLaunchHero />
      </>
    )
  }

  const hero = getHeroArticle()
  const editorsPick = getEditorsPick(hero?.slug)
  const mostRead = getMostReadArticles()

  // 카테고리 섹션에서 제외할 slug 목록 (hero + editor's pick — 중복 fatigue 방지)
  const excludeSlugs = [hero?.slug, editorsPick?.slug].filter(
    (s): s is string => Boolean(s),
  )

  return (
    <>
      <SEO path="/" />
      <AffiliateNotice />

      {hero && <HeroBlock article={hero} />}

      {editorsPick && editorsPick.slug !== hero?.slug && (
        <EditorsPickBlock article={editorsPick} />
      )}

      <div className="max-w-6xl mx-auto px-6">
        {ALL_CATEGORIES.map((cat, i) => (
          <div key={cat}>
            <CategorySection category={cat} excludeSlugs={excludeSlugs} />
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
        <img
          src={logoUrl}
          alt="Saint-Rémy"
          style={{
            height: '0.95em',
            width: 'auto',
            display: 'inline-block',
            verticalAlign: '-0.08em',
            marginRight: '0.25em',
          }}
        />
        Editors가 독립적으로 선정한 제품입니다.
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
  // DUEL 기사는 제품 PNG 2개로 합성 렌더 (baked hero.jpg 대신)
  // → airpods-pro-3.png / galaxy-buds-4-pro.png 를 바꾸면 즉시 반영.
  if (article.duelProducts && article.duelProducts.length >= 2) {
    return <DuelHeroBlock article={article} />
  }

  // 제목 패턴 감지
  // 1) "X vs Y" (e.g., AirPods Pro 3 vs Galaxy Buds 4 Pro) → 3 라인, vs 이탤릭
  // 2) 끝자리 숫자 ("선크림 BEST 5") → 숫자 이탤릭 Playfair
  const vsMatch = article.title.match(/^(.+?)\s+vs\s+(.+)$/i)
  const numMatch = !vsMatch
    ? article.title.match(/^(.+?)\s+(\d+)\s*$/)
    : null

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

          <div className="pt-8 text-left">
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                letterSpacing: '0.3em',
                color: 'var(--sr-muted)',
                marginBottom: '16px',
                textAlign: 'left',
              }}
            >
              — THIS WEEK'S FEATURE —
            </div>

            <div className="mb-6">
              <CategoryLabel category={article.category} />
            </div>

            <h1
              className="mt-2"
              style={{
                fontFamily: 'var(--font-serif-kr)',
                fontSize: 'var(--fs-h1)',
                fontWeight: 700,
                lineHeight: 1.15,
                color: 'var(--sr-ink)',
                textWrap: 'balance',
              }}
            >
              {vsMatch ? (
                <>
                  <span className="block">{vsMatch[1]}</span>
                  <em
                    className="block"
                    style={{
                      fontFamily: 'var(--font-display-en)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: '0.7em',
                      color: 'var(--sr-muted)',
                      margin: '0.2em 0',
                    }}
                  >
                    vs
                  </em>
                  <span className="block">{vsMatch[2]}</span>
                </>
              ) : numMatch ? (
                <>
                  {numMatch[1]}{' '}
                  <em
                    style={{
                      fontFamily: 'var(--font-display-en)',
                      fontStyle: 'italic',
                      fontSize: '1.4em',
                    }}
                  >
                    {numMatch[2]}
                  </em>
                </>
              ) : (
                article.title
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
              className="mt-5 flex gap-3"
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
// EDITOR'S PICK BLOCK — 히어로 아래 2슬롯 (4시간 블록 로테이션)
//   · 연구 기반: "Anchor + Rotate" 전략
//   · 앵커(hero) + 회전(pick)으로 재방문 참여 +12%, CTR 하락 없음
//   · 수평 레이아웃 (이미지 좌 + 텍스트 우) — 히어로와 시각 차별화
// ═══════════════════════════════════════════════════════════════
function EditorsPickBlock({ article }: { article: Article }) {
  return (
    <section
      className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10"
      style={{ borderTop: '1px dashed var(--sr-rule)' }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          letterSpacing: '0.3em',
          color: 'var(--sr-muted)',
          textAlign: 'center',
          marginTop: '24px',
          marginBottom: '24px',
        }}
      >
        — EDITOR'S PICK —
      </div>

      <Link to={`/a/${article.slug}`} className="block group">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6 md:gap-10 items-center">
          {/* 이미지 */}
          <div
            className="aspect-[4/3] w-full overflow-hidden"
            style={{
              backgroundColor: article.thumbnailColor ?? 'var(--sr-paper)',
            }}
          >
            {article.heroImage && (
              <img
                src={article.heroImage}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            )}
          </div>

          {/* 텍스트 */}
          <div>
            <div className="mb-4">
              <CategoryLabel category={article.category} />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif-kr)',
                fontSize: 'clamp(24px, 3.5vw, 40px)',
                fontWeight: 700,
                lineHeight: 1.2,
                color: 'var(--sr-ink)',
                letterSpacing: '-0.01em',
                textWrap: 'balance',
              }}
              className="group-hover:opacity-70 transition"
            >
              {article.title}
            </h2>
            <p
              style={{
                fontSize: 'var(--fs-body)',
                color: 'var(--sr-muted)',
                lineHeight: 1.6,
                marginTop: '12px',
              }}
            >
              {article.dek}
            </p>
            <div
              className="mt-4 flex gap-3 items-center"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-meta)',
                color: 'var(--sr-muted)',
              }}
            >
              <span>{formatDate(article.published)}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{article.readTime}분 읽기</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{article.author}</span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// DUEL HERO BLOCK — 제품 PNG 2개로 편집 커버를 React 합성 렌더
// baked hero.jpg 대신 → 제품 이미지 교체 시 즉시 반영
// ═══════════════════════════════════════════════════════════════
function DuelHeroBlock({ article }: { article: Article }) {
  const products = article.duelProducts!
  const a = products[0]
  const b = products[1]
  const accent = article.thumbnailColor ?? '#2A1810'

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <Link
        to={`/a/${article.slug}`}
        className="block group"
      >
        <article
          style={{
            backgroundColor: 'var(--sr-bg)',
            padding: 'clamp(24px, 5vw, 56px) clamp(16px, 4vw, 56px)',
            position: 'relative',
          }}
        >
          {/* 상단 유틸 바 */}
          <div className="flex items-start justify-between mb-8 md:mb-12">
            <div style={{ lineHeight: 1.8 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  letterSpacing: '0.28em',
                  color: 'var(--sr-ink)',
                }}
              >
                {article.categoryLabel || 'THE DUEL'}
              </div>
              {article.issueNumber && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.24em',
                    color: 'var(--sr-muted)',
                    marginTop: '4px',
                  }}
                >
                  ISSUE {article.issueNumber} · {formatDate(article.published)}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', lineHeight: 1 }}>
              <img
                src={logoUrl}
                alt="Saint-Rémy"
                style={{
                  height: '22px',
                  width: 'auto',
                  display: 'inline-block',
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  color: 'var(--sr-muted)',
                  fontStyle: 'italic',
                  marginTop: '6px',
                }}
              >
                saintremy.kr
              </div>
            </div>
          </div>

          {/* 제품 flanking + 중앙 타이틀 (데스크톱) / 수직 스택 (모바일) */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 py-6 md:py-10">
            {/* 왼쪽 제품 */}
            <div className="order-2 md:order-1 flex justify-center">
              <img
                src={a.image}
                alt={a.name}
                className="w-full max-w-[260px] md:max-w-[320px]"
                style={{ aspectRatio: '1', objectFit: 'contain' }}
                loading="eager"
              />
            </div>

            {/* 중앙 타이틀 */}
            <div className="order-1 md:order-2 text-center" style={{ minWidth: 'min(320px, 80vw)' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-serif-kr)',
                  fontSize: 'clamp(28px, 5vw, 56px)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'var(--sr-ink)',
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}
              >
                {a.name}
              </h1>
              <div
                className="mx-auto my-4 md:my-6"
                style={{
                  width: 'clamp(52px, 7vw, 72px)',
                  height: 'clamp(52px, 7vw, 72px)',
                  borderRadius: '50%',
                  backgroundColor: accent,
                  color: 'var(--sr-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display-en)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 'clamp(18px, 2.5vw, 24px)',
                }}
              >
                vs
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-serif-kr)',
                  fontSize: 'clamp(28px, 5vw, 56px)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'var(--sr-ink)',
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}
              >
                {b.name}
              </h1>
            </div>

            {/* 오른쪽 제품 */}
            <div className="order-3 flex justify-center">
              <img
                src={b.image}
                alt={b.name}
                className="w-full max-w-[260px] md:max-w-[320px]"
                style={{ aspectRatio: '1', objectFit: 'contain' }}
                loading="eager"
              />
            </div>
          </div>

          {/* 부제 + 시그니처 */}
          <div className="text-center mt-8 md:mt-12">
            <p
              style={{
                fontFamily: 'var(--font-serif-kr)',
                fontStyle: 'italic',
                fontSize: 'clamp(14px, 2vw, 17px)',
                color: 'var(--sr-muted)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {article.dek}
            </p>
            <div
              className="mx-auto my-5"
              style={{
                width: '120px',
                height: '1px',
                backgroundColor: 'var(--sr-rule)',
              }}
            />
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.28em',
                color: 'var(--sr-muted)',
              }}
            >
              SAINT-RÉMY EDITORS
            </div>
          </div>
        </article>
      </Link>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY SECTION — 카테고리별 제목 + 2px 라인 + 기사 또는 COMING SOON
// ═══════════════════════════════════════════════════════════════
function CategorySection({
  category,
  excludeSlugs = [],
}: {
  category: Category
  excludeSlugs?: string[]
}) {
  const meta = CATEGORY_META[category]
  const articles = getArticlesByCategory(category).filter(
    (a) => !excludeSlugs.includes(a.slug),
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
