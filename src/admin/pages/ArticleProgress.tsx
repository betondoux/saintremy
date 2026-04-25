import { Link, useParams } from 'react-router-dom'

export function ArticleProgress() {
  const { id } = useParams()
  return (
    <>
      <div className="topbar">
        <h1>드래프트 진행 상황</h1>
        <div className="topbar-actions">
          <Link className="btn btn-ghost" to="/dashboard">
            대시보드
          </Link>
        </div>
      </div>
      <div className="shell">
        <div className="form-card" style={{ maxWidth: 640 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 8px' }}>
            드래프트 저장 완료
          </h2>
          <p style={{ margin: '0 0 12px', color: 'var(--ink-soft)' }}>
            기사 생성 파이프라인(트렌드 → 픽 → 본문 → 컴플라이언스 → SEO)은{' '}
            <strong>Day 2</strong>에서 구현 예정입니다. 현재는 SQLite{' '}
            <code>drafts</code> 테이블에 입력 데이터가 저장만 됩니다.
          </p>
          <p className="meta">
            draft id: <code>{id}</code>
          </p>
          <div className="form-foot" style={{ marginTop: 24 }}>
            <Link className="btn btn-primary" to="/dashboard">
              대시보드로
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
