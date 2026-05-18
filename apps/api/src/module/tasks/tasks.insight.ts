import type { TaskAIInsight, TaskUrgentContext } from "@workspace/types"

type MeetingSummaryJson = {
  summary?: unknown
  keyPoints?: unknown
}

export type OpenTaskRow = { id: string; title: string }

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2)
  )
}

export function parseMeetingSummary(summary: unknown): {
  summaryText: string
  keyPoints: string[]
} {
  if (!summary || typeof summary !== "object") {
    return { summaryText: "", keyPoints: [] }
  }

  const parsed = summary as MeetingSummaryJson
  const summaryText =
    typeof parsed.summary === "string" ? parsed.summary.trim() : ""
  const keyPoints = Array.isArray(parsed.keyPoints)
    ? parsed.keyPoints.filter((point): point is string => typeof point === "string")
    : []

  return { summaryText, keyPoints }
}

export function scoreTaskRelevance(
  taskTitle: string,
  summaryText: string,
  keyPoints: string[]
): number {
  const taskTokens = tokenize(taskTitle)
  if (taskTokens.size === 0) return 0

  const corpus = `${summaryText} ${keyPoints.join(" ")}`.toLowerCase()
  let score = 0

  for (const token of taskTokens) {
    if (corpus.includes(token)) score += 1
  }

  for (const point of keyPoints) {
    const pointTokens = tokenize(point)
    const overlap = [...taskTokens].filter((token) => pointTokens.has(token)).length
    score += overlap * 2
  }

  return score
}

export function confidenceFromScore(score: number, maxScore: number): number {
  if (maxScore <= 0) return 72
  const ratio = score / maxScore
  return Math.min(96, Math.max(62, Math.round(62 + ratio * 34)))
}

export function countMentions(label: string, segments: string[]): number {
  const normalized = label.trim().toLowerCase()
  if (!normalized) return 0

  const keywords = normalized.split(/\W+/).filter((word) => word.length > 3)
  let count = 0

  for (const segment of segments) {
    const text = segment.toLowerCase()
    if (text.includes(normalized)) {
      count += 1
      continue
    }

    if (keywords.length === 0) continue

    const matched = keywords.filter((word) => text.includes(word)).length
    if (matched >= Math.ceil(keywords.length / 2)) count += 1
  }

  return count
}

export function buildUrgentContexts(
  keyPoints: string[],
  segments: string[],
  limit = 5
): TaskUrgentContext[] {
  return keyPoints.slice(0, limit).map((label) => {
    const mentionCount = countMentions(label, segments)
    return mentionCount > 1
      ? { label, mentionCount }
      : { label }
  })
}

export function buildTaskAIInsight(input: {
  meetingTitle: string
  meetingUpdatedAt: Date
  summary: unknown
  openTasks: OpenTaskRow[]
  transcriptSegments: string[]
}): TaskAIInsight | null {
  const { summaryText, keyPoints } = parseMeetingSummary(input.summary)
  if (input.openTasks.length === 0) return null

  const scored = input.openTasks
    .map((task) => ({
      task,
      score: scoreTaskRelevance(task.title, summaryText, keyPoints),
    }))
    .sort((a, b) => b.score - a.score)

  const maxScore = scored[0]?.score ?? 0
  const recommended = scored[0]!.task
  const alternate = scored[1]?.score ? scored[1]!.task : undefined

  const urgentContexts = buildUrgentContexts(
    keyPoints,
    input.transcriptSegments
  )

  return {
    meetingTitle: input.meetingTitle,
    meetingUpdatedAt: input.meetingUpdatedAt.toISOString(),
    recommendedTaskTitle: recommended.title,
    confidence: confidenceFromScore(scored[0]!.score, maxScore),
    ...(alternate ? { alternateTaskTitle: alternate.title } : {}),
    urgentContexts,
  }
}
