import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <div className="typewriter-label text-signal mb-3">— ABOUT</div>
        <h1 className="masthead text-5xl md:text-7xl text-ink-900 leading-none">
          About
        </h1>
        <p className="headline-italic text-xl md:text-2xl text-ink-700 mt-6 leading-snug">
          운동하는 사람들,
          <br />
          그냥 좋아서 하는 사람들.
        </p>
      </header>

      <div className="article-body space-y-8 body-text text-ink-900 text-base md:text-lg leading-[1.75]">
        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            AMATOR란
          </h2>
          <p>
            AMATOR는 라틴어로 "사랑하는 사람"을 뜻합니다. 어떤 이유도 필요
            없이, 그냥 좋아서 하는 사람. 직업도, 성공도, 순위도 아닌 — 그저
            사랑하기 때문에 계속하는 사람.
          </p>
          <p className="mt-4">
            헬스, 주짓수, 축구, 러닝, 요가, 필라테스, 테니스, 배드민턴. 형식은
            다르지만, 어느 새벽에 눈 뜨면 가야 할 곳이 있는 사람들의 이야기는
            비슷합니다. AMATOR는 그 사람들의 매거진입니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            우리는 이렇게 씁니다
          </h2>
          <p>
            모든 기사는 <strong>논문과 데이터</strong>에서 시작합니다. JAMA,
            Nature, Mayo Clinic Proceedings, BJSM — 운동과 건강에 대한 가장
            믿을 만한 연구들을 읽고, 한국 아마추어의 언어로 번역합니다.
          </p>
          <p className="mt-4">
            <strong>가장 최신의, 가장 신뢰할 만한 정보만.</strong> 블로그
            카피페이스트나 광고 글이 아닙니다. 원본 논문에서 직접 인용하고,
            출처를 모두 공개합니다. 틀릴 수 있는 정보는 "확인되지 않았다"고
            말합니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            상품 추천의 원칙
          </h2>
          <p>
            AMATOR는 <strong>어필리에이트 프로그램</strong>을 통해 운영됩니다.
            사이트 내 상품 링크를 통해 구매가 이루어지면 운영비로 사용되는
            수수료를 받습니다.
          </p>
          <p className="mt-4">
            그러나{' '}
            <strong>
              수수료율에 관계없이, 실제로 추천할 만한 상품만 소개합니다.
            </strong>{' '}
            이게 The Strategist가 10년간 지켜온 원칙이고, AMATOR도 같은 길을
            갑니다. 판매를 위해 콘텐츠를 만들지 않습니다. 좋은 콘텐츠가
            추천을 만듭니다.
          </p>
          <p className="mt-4">
            AMATOR는{' '}
            <Link to="/terms" className="text-signal underline">
              이용약관
            </Link>
            에 어필리에이트 관계를 명시하고 있으며, 모든 협찬 콘텐츠는 협찬
            표시와 함께 공개합니다.
          </p>
        </section>

        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            6가지 카테고리
          </h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Link
              to="/lift"
              className="p-4 border border-ink-900/20 hover:border-signal hover:bg-cream-200/50 transition"
            >
              <div className="text-3xl mb-2">💪</div>
              <div className="headline text-lg text-ink-900">Lift</div>
              <div className="body-text text-ink-500 text-xs mt-1">
                힘의 과학
              </div>
            </Link>
            <Link
              to="/combat"
              className="p-4 border border-ink-900/20 hover:border-signal hover:bg-cream-200/50 transition"
            >
              <div className="text-3xl mb-2">🥋</div>
              <div className="headline text-lg text-ink-900">Combat</div>
              <div className="body-text text-ink-500 text-xs mt-1">
                침착함의 기술
              </div>
            </Link>
            <Link
              to="/football"
              className="p-4 border border-ink-900/20 hover:border-signal hover:bg-cream-200/50 transition"
            >
              <div className="text-3xl mb-2">⚽</div>
              <div className="headline text-lg text-ink-900">Football</div>
              <div className="body-text text-ink-500 text-xs mt-1">
                공을 차는 일
              </div>
            </Link>
            <Link
              to="/run"
              className="p-4 border border-ink-900/20 hover:border-signal hover:bg-cream-200/50 transition"
            >
              <div className="text-3xl mb-2">🏃</div>
              <div className="headline text-lg text-ink-900">Run</div>
              <div className="body-text text-ink-500 text-xs mt-1">
                달리는 사람
              </div>
            </Link>
            <Link
              to="/flow"
              className="p-4 border border-ink-900/20 hover:border-signal hover:bg-cream-200/50 transition"
            >
              <div className="text-3xl mb-2">🧘</div>
              <div className="headline text-lg text-ink-900">Flow</div>
              <div className="body-text text-ink-500 text-xs mt-1">
                매트 위의 호흡
              </div>
            </Link>
            <Link
              to="/court"
              className="p-4 border border-ink-900/20 hover:border-signal hover:bg-cream-200/50 transition"
            >
              <div className="text-3xl mb-2">🎾</div>
              <div className="headline text-lg text-ink-900">Court</div>
              <div className="body-text text-ink-500 text-xs mt-1">
                랠리하는 사람
              </div>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="headline text-2xl md:text-3xl text-ink-900 mb-4">
            운영자
          </h2>
          <div className="p-6 bg-cream-200/50 border-l-2 border-signal">
            <p>
              <strong>DUCK DIVE</strong>는 인디 개발자 김태원이 운영하는 1인
              스튜디오입니다. 서울 기반. 2026년 설립.
            </p>
            <p className="mt-3">
              AMATOR 외에도 모바일 앱과 게임을 만들고, 유튜브 채널{' '}
              <a
                href="https://youtube.com/@amator.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal underline"
              >
                @amator.kr
              </a>
              에서 영상 에디토리얼을 제작합니다.
            </p>
            <p className="mt-3">
              문의:{' '}
              <a
                href="mailto:lonelyjar2@gmail.com"
                className="text-signal underline"
              >
                lonelyjar2@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="text-center py-8">
          <p className="headline-italic text-2xl text-ink-700">
            "그냥 좋아서 하는 사람."
          </p>
          <p className="typewriter text-ink-500 mt-3">
            AMATOR · 2026
          </p>
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
