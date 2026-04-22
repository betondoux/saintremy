import { useState } from 'react'

interface Props {
  youtubeId: string
  title: string
  readTime: number
  /** 영상 길이 (분). 없으면 '본문 읽기 시간'과 동일 가정 */
  videoMinutes?: number
}

/**
 * VideoHero — The Strategist 스타일의 기사 최상단 시네마틱 영상 영역.
 *
 * 디자인 철학:
 * - 영상을 "히어로 이미지"처럼 사용 (16:9 와이드)
 * - 썸네일 우선 (lazy load) → 클릭 시 실제 임베드 로드
 * - "Watch N min · Read M min" 선택 UX
 * - 매거진처럼 캡션 + 에피소드 넘버
 */
export function VideoHero({
  youtubeId,
  title,
  readTime,
  videoMinutes,
}: Props) {
  const [loaded, setLoaded] = useState(false)

  const thumbnailUrl = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
  const fallbackThumbnail = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`

  return (
    <div className="mb-8 -mx-6 md:-mx-0">
      {/* ══════════════════════════════════════════════════════════
          VIEWING MODE INDICATOR — "Watch or Read" 
          ══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-center gap-2 mb-4 text-center">
        <div className="typewriter-label text-signal">— WATCH OR READ</div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          YOUTUBE EMBED — 시네마틱 16:9 플레이어
          썸네일 우선 표시 → 클릭 시 iframe 로드 (성능 최적화)
          ══════════════════════════════════════════════════════════ */}
      <div className="relative w-full bg-ink-900 overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        {!loaded ? (
          <button
            onClick={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full group cursor-pointer"
            aria-label={`${title} 영상 재생`}
          >
            {/* Thumbnail */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = fallbackThumbnail
              }}
              loading="lazy"
            />

            {/* Gradient overlay for play button visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

            {/* Red play button — YouTube style */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-14 md:w-24 md:h-16 bg-signal flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <div
                  className="w-0 h-0 ml-2"
                  style={{
                    borderLeft: '18px solid white',
                    borderTop: '12px solid transparent',
                    borderBottom: '12px solid transparent',
                  }}
                />
              </div>
            </div>

            {/* Corner label — SAINT-RÉMY FILMS */}
            <div className="absolute top-4 left-4 bg-cream-100 px-3 py-1">
              <span className="typewriter-label text-ink-900 text-xs">
                SAINT-RÉMY FILMS
              </span>
            </div>

            {/* Bottom caption */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <div className="typewriter-label text-cream-100/80 text-xs mb-1">
                CLICK TO WATCH
              </div>
              {videoMinutes && (
                <div className="typewriter text-cream-100 text-sm">
                  {videoMinutes}분 영상
                </div>
              )}
            </div>
          </button>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          CAPTION BAR — 에디토리얼 캡션 (영상 아래)
          ══════════════════════════════════════════════════════════ */}
      <div className="mt-3 px-6 md:px-0 flex items-center justify-between gap-4 flex-wrap">
        <div className="typewriter text-ink-500 text-xs">
          {videoMinutes ? (
            <>
              <span className="text-ink-900">WATCH</span> {videoMinutes}분
              <span className="mx-2 opacity-40">/</span>
              <span className="text-ink-900">READ</span> {readTime}분
            </>
          ) : (
            <>
              <span className="text-ink-900">READ</span> {readTime}분 읽기
            </>
          )}
        </div>
        <a
          href={`https://youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="typewriter-label text-ink-500 hover:text-signal transition"
        >
          YOUTUBE에서 보기 ↗
        </a>
      </div>

      {/* Dotted rule 구분선 */}
      <div className="dotted-rule mt-6 md:mt-8" />
    </div>
  )
}
