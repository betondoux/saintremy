import { LocalPreviewBanner } from '../components/LocalPreviewBanner'
import { PageHeader } from '../components/PageHeader'

export function ABTests() {
  return (
    <>
      <LocalPreviewBanner />
      <PageHeader
        title="A/B Tests"
        subtitle="제목·썸네일·CTA 변형 실험 (Phase 4)"
      />
      <div className="card" style={{ color: 'var(--text-secondary)' }}>
        <p className="mb-3">
          Phase 4에서 활성화되는 섹션입니다. 다음 기능이 제공될 예정:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>기사 제목 A/B — SEO·SNS 공유 시 CTR 비교</li>
          <li>Hero 썸네일 A/B — 첫 이미지 변형</li>
          <li>제휴 CTA 문구 A/B ("지금 구매" vs "가격 확인")</li>
          <li>통계적 유의성 자동 계산 (Bayesian + frequentist)</li>
        </ul>
        <div className="mt-6 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          데이터 테이블: <code>ab_tests</code>, <code>ab_assignments</code>
        </div>
      </div>
    </>
  )
}
