/**
 * Saint-Rémy 6 에이전트 래퍼.
 *
 * 1. editor-in-chief    — Strategist 5-point check, 스코프/톤 락
 * 2. trend-scout        — 5~10 피치 + 제품 후보
 * 3. product-vetter     — 6-gate 검증, 픽 3~7
 * 4. copy-strategist    — 한국어 본문 (Markdown)
 * 5. affiliate-compliance — 공정위/Coupang Partners 표시 검사
 * 6. seo-architect      — slug/meta/OG/JSON-LD
 */
import { runAgent, type AgentResult } from './base.ts'

export type Intake = {
  topic: string
  category: string
  format: string
  channels: string[]
  priceRange: { min: number | null; max: number | null } | null
  customInstructions: string | null
}

export async function runEditorInChief(intake: Intake, draftId: string): Promise<AgentResult> {
  return runAgent({
    name: 'saintremy-editor-in-chief',
    input: intake,
    draftId,
    maxTokens: 4000,
    temperature: 0.4,
  })
}

export async function runTrendScout(brief: unknown, draftId: string): Promise<AgentResult> {
  return runAgent({
    name: 'trend-scout',
    input: brief,
    draftId,
    maxTokens: 12000,
    temperature: 0.6,
  })
}

export async function runProductVetter(candidates: unknown, draftId: string): Promise<AgentResult> {
  return runAgent({
    name: 'product-vetter',
    input: candidates,
    draftId,
    maxTokens: 12000,
    temperature: 0.3,
  })
}

export async function runCopyStrategist(picks: unknown, draftId: string): Promise<AgentResult> {
  return runAgent({
    name: 'copy-strategist',
    input: picks,
    draftId,
    maxTokens: 16000,
    temperature: 0.7,
  })
}

export async function runComplianceOfficer(body: unknown, draftId: string): Promise<AgentResult> {
  return runAgent({
    name: 'affiliate-compliance-officer',
    input: body,
    draftId,
    maxTokens: 8000,
    temperature: 0.2,
  })
}

export async function runSeoArchitect(article: unknown, draftId: string): Promise<AgentResult> {
  return runAgent({
    name: 'seo-architect',
    input: article,
    draftId,
    maxTokens: 4000,
    temperature: 0.3,
  })
}
