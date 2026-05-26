/**
 * ShopPage — 저속노화 상품 큐레이션 (2026-05-26~).
 *
 * 라우트:
 *   /shop                — 5트랙 hub 진입
 *   /shop/:track         — 트랙별 큐레이션 (move/eat/sleep/mind/track)
 *
 * 톤: 매거진 큐레이션. "별점·TOP 10" 금지. 매 상품 = 한 줄 매거진 카피 + 1차 자료.
 */
import { Link, useParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import {
  PRODUCT_TRACK_META,
  getProductsByTrack,
  type LongevityTrack,
  type LongevityProduct,
} from '../content/longevity-products'

const TRACKS: LongevityTrack[] = ['move', 'eat', 'sleep', 'mind', 'track']

function Disclosure() {
  return (
    <div
      className="text-[0.65rem] uppercase tracking-[0.28em] text-ink-500 border-t border-b border-ink-900/10 py-3 my-8"
      style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
    >
      AD · DISCLOSURE &nbsp;·&nbsp; Saint-Rémy 는 본 페이지의 일부 링크로 발생하는 구매에 한해 일정 수수료를 받습니다. 추천은 매거진 편집부가 운동·식단·수면·정신·측정 다섯 변수의 의학 데이터를 기준으로 선정합니다.
    </div>
  )
}

function ProductCard({ p }: { p: LongevityProduct }) {
  return (
    <article className="border-t border-ink-900/10 py-8 md:py-10 grid md:grid-cols-12 gap-6 md:gap-8">
      <div className="md:col-span-4 aspect-square bg-ink-900/[0.04] rounded-2xl overflow-hidden flex items-center justify-center">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            className="text-ink-900/30 uppercase tracking-[0.32em] text-[0.7rem] text-center px-4"
            style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
          >
            {p.brand}
          </span>
        )}
      </div>
      <div className="md:col-span-8">
        <div
          className="text-[0.6rem] uppercase tracking-[0.32em] text-ink-500 mb-3"
          style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
        >
          {p.brand} &nbsp;·&nbsp; {p.priceLabel}
        </div>
        <h3
          className="text-ink-900 leading-[1.15] mb-3"
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(1.25rem, 2vw, 1.6rem)',
            letterSpacing: '-0.015em',
          }}
        >
          {p.name}
        </h3>
        <p
          className="text-ink-900 mb-4 leading-[1.45]"
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 600,
            fontSize: '1.05rem',
          }}
        >
          {p.oneLine}
        </p>
        {p.rationale && (
          <p
            className="text-ink-700 leading-[1.6] mb-4 max-w-2xl"
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 400,
              fontSize: '0.95rem',
            }}
          >
            {p.rationale}
          </p>
        )}
        <div className="flex items-center gap-4 flex-wrap">
          {p.source && (
            <span
              className="text-[0.65rem] uppercase tracking-[0.28em] text-ink-500"
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
              className="inline-flex items-center gap-2 rounded-full border border-ink-900 bg-transparent text-ink-900 px-5 py-2 text-[0.7rem] uppercase tracking-[0.28em] hover:bg-ink-900 hover:text-white transition-colors"
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}
            >
              구매 →
            </a>
          ) : (
            <span
              className="text-[0.65rem] uppercase tracking-[0.28em] text-ink-400"
              style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
            >
              구매 링크 준비 중
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export function ShopPage() {
  return (
    <div className="bg-white text-ink-900">
      <SEO
        title="SHOP — Saint-Rémy"
        description="저속노화 매거진이 큐레이션한 5트랙 상품 — 운동·식단·수면·정신·측정. 의학 데이터를 기준으로 매주 갱신."
        path="/shop"
      />
      <section className="px-5 md:px-10 pt-12 md:pt-20 pb-10">
        <div
          className="text-[0.65rem] uppercase tracking-[0.32em] text-ink-500 mb-6"
          style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
        >
          SAINT-RÉMY · SHOP
        </div>
        <h1
          className="text-ink-900 leading-[0.85] uppercase mb-8"
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(4rem, 18vw, 14rem)',
            letterSpacing: '-0.055em',
          }}
        >
          SHOP
        </h1>
        <p
          className="text-ink-700 leading-[1.6] max-w-2xl"
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
          }}
        >
          저속노화의 5가지 변수 — 운동·식단·수면·정신·측정. 매거진 편집부가 의학 데이터(JAMA·Lancet·Sleep·NEJM)와 1차 자료로 골라 둡니다. <em>Less, but deeper.</em>
        </p>
      </section>

      <section className="px-5 md:px-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRACKS.map((t) => {
            const meta = PRODUCT_TRACK_META[t]
            const count = getProductsByTrack(t).length
            return (
              <Link
                key={t}
                to={`/shop/${t}`}
                className="group block p-6 md:p-8 rounded-2xl border border-ink-900/15 hover:border-ink-900 hover:bg-ink-900 hover:text-white transition-colors"
              >
                <div
                  className="text-[0.6rem] uppercase tracking-[0.32em] opacity-60 mb-3"
                  style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
                >
                  {count}개의 상품
                </div>
                <div
                  className="leading-[0.95] mb-3"
                  style={{
                    fontFamily: 'Pretendard, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {meta.title}
                </div>
                <p
                  className="text-[0.95rem] leading-[1.55] opacity-80"
                  style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400 }}
                >
                  {meta.subtitle}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export function ShopCategoryPage() {
  const { track } = useParams<{ track?: string }>()
  const t = track as LongevityTrack | undefined

  if (!t || !TRACKS.includes(t)) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="text-[0.7rem] uppercase tracking-[0.32em] text-ink-500 mb-4">
          — 404
        </div>
        <div className="text-3xl text-ink-900">상품 카테고리를 찾을 수 없습니다.</div>
        <Link to="/shop" className="inline-block mt-6 text-ink-500 underline">
          ← SHOP 로 돌아가기
        </Link>
      </div>
    )
  }

  const meta = PRODUCT_TRACK_META[t]
  const products = getProductsByTrack(t)

  return (
    <div className="bg-white text-ink-900">
      <SEO
        title={`SHOP · ${meta.title} — Saint-Rémy`}
        description={meta.intro}
        path={`/shop/${t}`}
      />
      <section className="px-5 md:px-10 pt-12 md:pt-20 pb-10">
        <div
          className="text-[0.65rem] uppercase tracking-[0.32em] text-ink-500 mb-6 flex items-center gap-3 flex-wrap"
          style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}
        >
          <Link to="/shop" className="hover:text-ink-900">SHOP</Link>
          <span>·</span>
          <span>{meta.title}</span>
        </div>
        <h1
          className="text-ink-900 leading-[0.85] uppercase mb-8"
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(3.5rem, 14vw, 11rem)',
            letterSpacing: '-0.055em',
          }}
        >
          {meta.title.split(' · ')[0]}
        </h1>
        <p
          className="text-ink-700 leading-[1.6] max-w-2xl"
          style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
          }}
        >
          {meta.intro}
        </p>
      </section>

      <section className="px-5 md:px-10 pb-20 max-w-5xl mx-auto">
        <Disclosure />
        {products.length === 0 ? (
          <div className="py-16 text-center text-ink-500">
            첫 큐레이션이 곧 올라옵니다.
          </div>
        ) : (
          products.map((p) => <ProductCard key={p.id} p={p} />)
        )}
      </section>
    </div>
  )
}
