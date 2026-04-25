export const fmt = {
  n: (v: number) => (v ?? 0).toLocaleString('ko-KR'),
  krw: (v: number) => `₩${(v ?? 0).toLocaleString('ko-KR')}`,
  pct: (v: number, digits = 1) => `${(v ?? 0).toFixed(digits)}%`,
  sec: (v: number) => {
    if (!v) return '0초'
    if (v < 60) return `${Math.round(v)}초`
    const m = Math.floor(v / 60)
    const s = Math.round(v % 60)
    return `${m}분 ${s}초`
  },
  delta: (curr: number, prev: number) => {
    if (!prev) return { value: 0, label: '—' }
    const diff = ((curr - prev) / prev) * 100
    return {
      value: diff,
      label: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
    }
  },
  shortDate: (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()}`
  },
  relativeTime: (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60_000) return '방금'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
    return `${Math.floor(diff / 86_400_000)}일 전`
  },
}
