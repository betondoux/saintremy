import { Link } from 'react-router-dom'
import { ALL_CATEGORIES, CATEGORY_META } from '../content/articles'

/**
 * AboutPage
 *
 * TODO(브랜드): Saint-Rémy 브랜드 서사 확정 후 본문 재작성.
 * 현재는 AMATOR → Saint-Rémy 기계 리네이밍만 적용된 상태이며,
 * "우리는 이렇게 씁니다" 섹션 등은 라이프스타일 매거진 톤으로 다시 쓸 예정.
 */
export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <div className="typewriter-label text-signal mb-3">— ABOUT</div>
        <h1 className="masthead text-5xl md:text-7xl text-ink-900 leading-none">
          About
        </h1>
        <p className="headline-italic text-xl md:text-2xl text-ink-700 mt-6 leading-snug">
          평범한 사물을 깊이 보는 매거진.
        </p>
      </header>

      <div className="article-body space-y-8 body-text text-ink-900 text-base md:text-lg leading-[1.75]">
        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            Saint-Rémy란
          </h2>
          <p>
            Saint-Rémy는 선물, 할인, 스타일, 뷰티, 공간, 주방, 운동, 여행, 가구,
            생활 — 일상에서 한 번쯤 눈길을 주는 열 가지 카테고리를 다룹니다.
            덜 사고, 더 잘 쓰는 사람들을 위한 에디토리얼 큐레이션.
          </p>
          <p className="mt-4">
            <em>[TODO: Saint-Rémy 브랜드 서사 — 이 자리에 지명/역사/철학을 엮은 정식 introduction 예정.]</em>
          </p>
        </section>

        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            우리는 이렇게 씁니다
          </h2>
          <p>
            형식보다 취향. 스펙보다 맥락. 광고가 아니라 에디토리얼.
            모든 추천에는 이유가 붙고, 모든 링크의 성격은 투명하게 공개됩니다.
          </p>
          <p className="mt-4">
            <em>[TODO: 편집 방식·소스 검증 원칙을 라이프스타일 톤으로 재작성 예정.]</em>
          </p>
        </section>

        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            상품 추천의 원칙
          </h2>
          <p>
            Saint-Rémy는 <strong>어필리에이트 프로그램</strong>을 통해 운영됩니다.
            사이트 내 상품 링크를 통해 구매가 이루어지면 운영비로 사용되는
            수수료를 받습니다.
          </p>
          <p className="mt-4">
            그러나{' '}
            <strong>
              수수료율에 관계없이, 실제로 추천할 만한 상품만 소개합니다.
            </strong>{' '}
            이게 The Strategist가 10년간 지켜온 원칙이고, Saint-Rémy도 같은
            길을 갑니다. 판매를 위해 콘텐츠를 만들지 않습니다. 좋은 콘텐츠가
            추천을 만듭니다.
          </p>
          <p className="mt-4">
            Saint-Rémy는{' '}
            <Link to="/terms" className="text-signal underline">
              이용약관
            </Link>
            에 어필리에이트 관계를 명시하고 있으며, 모든 협찬 콘텐츠는 협찬
            표시와 함께 공개합니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            10가지 카테고리
          </h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat]
              return (
                <Link
                  key={cat}
                  to={`/${cat}`}
                  className="p-4 border border-ink-900/20 hover:border-signal hover:bg-cream-200/50 transition"
                >
                  <div className="text-3xl mb-2">{meta.icon}</div>
                  <div className="headline text-lg text-ink-900">
                    {meta.title}
                  </div>
                  <div className="body-text text-ink-500 text-xs mt-1">
                    {meta.subtitle}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            운영자
          </h2>
          <div className="p-6 bg-cream-200/50 border-l-2 border-signal">
            <p>
              <strong>LLSV</strong>는 서울 기반 매거진 스튜디오입니다.
              2026년 설립.
            </p>
            <p className="mt-3">
              문의:{' '}
              <a
                href="mailto:adrenoir@naver.com"
                className="text-signal underline"
              >
                adrenoir@naver.com
              </a>
            </p>
          </div>
        </section>

      </div>

      <div className="mt-10 pt-8 border-t-2 border-ink-900 text-center">
        <Link
          to="/"
          className="typewriter-label text-signal hover:underline"
        >
          ← 홈으로
        </Link>
      </div>
    </div>
  )
}
