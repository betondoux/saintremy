/**
 * 인메모리 jobs 큐.
 *
 * - draftId 당 단일 EventEmitter (중복 시작 방지)
 * - SSE 클라이언트가 늦게 붙어도, lastEvents 캐시로 현재 상태 즉시 전송
 * - 종료 후 60초 동안 emitter 유지 (재접속 허용) → 이후 정리
 */
import { EventEmitter } from 'node:events'
import { runPipeline } from '../agents/orchestrator.ts'

export type JobEvent =
  | { type: 'progress'; data: Record<string, unknown> }
  | { type: 'done'; data: Record<string, unknown> }
  | { type: 'error'; data: Record<string, unknown> }

export class JobChannel extends EventEmitter {
  readonly draftId: string
  readonly history: JobEvent[] = []
  finished = false
  finishedAt: number | null = null

  constructor(draftId: string) {
    super()
    this.draftId = draftId
    this.setMaxListeners(50)

    const record = (type: JobEvent['type']) => (data: Record<string, unknown>) => {
      this.history.push({ type, data })
      if (type === 'done' || type === 'error') {
        this.finished = true
        this.finishedAt = Date.now()
      }
    }
    this.on('progress', record('progress'))
    this.on('done', record('done'))
    this.on('error', record('error'))
  }
}

const channels = new Map<string, JobChannel>()

const RETENTION_MS = 60_000

function gc(): void {
  const now = Date.now()
  for (const [id, ch] of channels) {
    if (ch.finished && ch.finishedAt && now - ch.finishedAt > RETENTION_MS) {
      ch.removeAllListeners()
      channels.delete(id)
    }
  }
}

export function startJob(draftId: string): JobChannel {
  gc()
  const existing = channels.get(draftId)
  if (existing && !existing.finished) return existing

  const channel = new JobChannel(draftId)
  channels.set(draftId, channel)

  // fire-and-forget; 결과는 EventEmitter 로
  void runPipeline(draftId, channel).catch((err) => {
    // runPipeline 내부에서 이미 catch → emit 하지만, 방어
    const message = err instanceof Error ? err.message : String(err)
    if (!channel.finished) {
      channel.emit('error', { step: 'unknown', message })
    }
  })

  return channel
}

export function getChannel(draftId: string): JobChannel | null {
  gc()
  return channels.get(draftId) ?? null
}

export function isRunning(draftId: string): boolean {
  const ch = channels.get(draftId)
  return !!ch && !ch.finished
}
