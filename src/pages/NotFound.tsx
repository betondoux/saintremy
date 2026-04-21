import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="typewriter-label text-ink-500 mb-4">— 404</div>
      <h1 className="headline-italic text-4xl md:text-5xl text-ink-900 leading-tight mb-4">
        찾으시는 페이지가 없습니다
      </h1>
      <p className="body-text text-ink-500 mb-8">
        URL을 다시 확인하시거나, 아래 링크로 돌아가세요.
      </p>
      <Link
        to="/"
        className="typewriter-label text-signal hover:underline"
      >
        ← 홈으로 돌아가기
      </Link>
    </div>
  )
}
