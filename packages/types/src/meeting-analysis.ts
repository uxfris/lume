import { z } from "zod"

/** Minimal ProseMirror / Tiptap JSON (no @tiptap/core dependency). */
export type TiptapJSONContent = {
  type?: string
  attrs?: Record<string, unknown>
  content?: TiptapJSONContent[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

export const MeetingSentimentSchema = z.enum([
  "positive",
  "neutral",
  "negative",
  "mixed",
])
export type MeetingSentiment = z.infer<typeof MeetingSentimentSchema>

export const MeetingActionItemSchema = z.object({
  title: z.string(),
  assigneeHint: z.string().nullable(),
})
export type MeetingActionItem = z.infer<typeof MeetingActionItemSchema>

/** Structured analysis from the LLM before conversion to a Tiptap document. */
export const MeetingAnalysisContentSchema = z.object({
  overview: z.string(),
  keyTakeaways: z.array(z.string()),
  topicsDiscussed: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
    })
  ),
  decisions: z.array(z.string()),
  openQuestions: z.array(z.string()),
  actionItems: z.array(MeetingActionItemSchema),
  sentiment: MeetingSentimentSchema,
})
export type MeetingAnalysisContent = z.infer<typeof MeetingAnalysisContentSchema>

/** Persisted in `meeting.summary` (JSON column) — version 2. */
export const MeetingSummaryV2Schema = z.object({
  version: z.literal(2),
  doc: z.custom<TiptapJSONContent>(),
  sentiment: MeetingSentimentSchema,
  actionItems: z.array(MeetingActionItemSchema),
})
export type MeetingSummaryV2 = z.infer<typeof MeetingSummaryV2Schema>

/** Legacy persisted shape (version 1 / implicit). */
export const MeetingSummaryLegacySchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  sentiment: z.string(),
  actionItems: z.array(MeetingActionItemSchema),
})
export type MeetingSummaryLegacy = z.infer<typeof MeetingSummaryLegacySchema>

function textNode(text: string): TiptapJSONContent {
  return { type: "text", text }
}

function paragraph(text: string): TiptapJSONContent {
  const trimmed = text.trim()
  return {
    type: "paragraph",
    content: trimmed ? [textNode(trimmed)] : undefined,
  }
}

function heading(level: 2 | 3, text: string): TiptapJSONContent {
  return {
    type: "heading",
    attrs: { level },
    content: [textNode(text)],
  }
}

function bulletList(items: string[]): TiptapJSONContent {
  return {
    type: "bulletList",
    content: items
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({
        type: "listItem",
        content: [paragraph(item)],
      })),
  }
}

function taskList(items: MeetingActionItem[]): TiptapJSONContent {
  return {
    type: "taskList",
    content: items
      .map((item) => item.title.trim())
      .filter(Boolean)
      .map((title) => ({
        type: "taskItem",
        attrs: { checked: false },
        content: [paragraph(title)],
      })),
  }
}

/** Convert LLM analysis sections into a Tiptap `doc` for the meeting editor. */
export function buildTiptapDocFromAnalysis(
  analysis: MeetingAnalysisContent
): TiptapJSONContent {
  const blocks: TiptapJSONContent[] = []

  if (analysis.overview.trim()) {
    blocks.push(heading(2, "Overview"))
    blocks.push(paragraph(analysis.overview))
  }

  const takeaways = analysis.keyTakeaways.map((s) => s.trim()).filter(Boolean)
  if (takeaways.length > 0) {
    blocks.push(heading(2, "Key takeaways"))
    blocks.push(bulletList(takeaways))
  }

  const topics = analysis.topicsDiscussed.filter(
    (t) => t.title.trim() || t.summary.trim()
  )
  if (topics.length > 0) {
    blocks.push(heading(2, "Topics discussed"))
    for (const topic of topics) {
      blocks.push(heading(3, topic.title.trim() || "Topic"))
      if (topic.summary.trim()) {
        blocks.push(paragraph(topic.summary))
      }
    }
  }

  const decisions = analysis.decisions.map((s) => s.trim()).filter(Boolean)
  if (decisions.length > 0) {
    blocks.push(heading(2, "Decisions"))
    blocks.push(bulletList(decisions))
  }

  const openQuestions = analysis.openQuestions
    .map((s) => s.trim())
    .filter(Boolean)
  if (openQuestions.length > 0) {
    blocks.push(heading(2, "Open questions"))
    blocks.push(bulletList(openQuestions))
  }

  const actions = analysis.actionItems.filter((a) => a.title.trim())
  if (actions.length > 0) {
    blocks.push(heading(2, "Action items"))
    blocks.push(taskList(actions))
  }

  if (blocks.length === 0) {
    return { type: "doc", content: [{ type: "paragraph" }] }
  }

  return { type: "doc", content: blocks }
}

/** Build a Tiptap doc from legacy v1 summary JSON. */
export function buildTiptapDocFromLegacy(
  legacy: MeetingSummaryLegacy
): TiptapJSONContent {
  return buildTiptapDocFromAnalysis({
    overview: legacy.summary,
    keyTakeaways: legacy.keyPoints,
    topicsDiscussed: [],
    decisions: [],
    openQuestions: [],
    actionItems: legacy.actionItems,
    sentiment:
      MeetingSentimentSchema.safeParse(legacy.sentiment).data ?? "neutral",
  })
}

export function isMeetingSummaryV2(
  value: unknown
): value is MeetingSummaryV2 {
  return MeetingSummaryV2Schema.safeParse(value).success
}

export function parseMeetingSummary(raw: unknown): {
  doc: TiptapJSONContent
  sentiment: MeetingSentiment
  actionItems: MeetingActionItem[]
} | null {
  if (!raw || typeof raw !== "object") return null

  const v2 = MeetingSummaryV2Schema.safeParse(raw)
  if (v2.success) {
    return {
      doc: v2.data.doc,
      sentiment: v2.data.sentiment,
      actionItems: v2.data.actionItems,
    }
  }

  const legacy = MeetingSummaryLegacySchema.safeParse(raw)
  if (legacy.success) {
    return {
      doc: buildTiptapDocFromLegacy(legacy.data),
      sentiment:
        MeetingSentimentSchema.safeParse(legacy.data.sentiment).data ??
        "neutral",
      actionItems: legacy.data.actionItems,
    }
  }

  return null
}

/** Plain text for list cards, search blobs, and previews. */
export function extractPlainTextFromDoc(
  doc: TiptapJSONContent,
  maxLength?: number
): string {
  const parts: string[] = []

  function walk(node: TiptapJSONContent) {
    if (node.text) parts.push(node.text)
    node.content?.forEach(walk)
  }

  walk(doc)
  const text = parts.join(" ").replace(/\s+/g, " ").trim()
  if (maxLength != null && text.length > maxLength) {
    return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
  }
  return text
}

/** First bullet list under a level-2 heading (used for legacy `keyPoints` API field). */
export function extractBulletItemsAfterHeading(
  doc: TiptapJSONContent,
  headingText: string
): string[] {
  const content = doc.content ?? []
  const target = headingText.toLowerCase()
  let foundHeading = false
  const items: string[] = []

  for (const node of content) {
    if (node.type === "heading" && node.attrs?.level === 2) {
      const label = node.content?.[0]?.text?.toLowerCase() ?? ""
      foundHeading = label.includes(target)
      continue
    }
    if (foundHeading && node.type === "bulletList") {
      for (const listItem of node.content ?? []) {
        const text = extractPlainTextFromDoc(listItem)
        if (text) items.push(text)
      }
      break
    }
    if (foundHeading && node.type === "heading") {
      break
    }
  }

  return items
}

export function buildMeetingSummaryV2(
  analysis: MeetingAnalysisContent
): MeetingSummaryV2 {
  return {
    version: 2,
    doc: buildTiptapDocFromAnalysis(analysis),
    sentiment: analysis.sentiment,
    actionItems: analysis.actionItems,
  }
}

/** Normalize editor JSON into a valid Tiptap root `doc` node. */
export function normalizeTiptapDoc(doc: TiptapJSONContent): TiptapJSONContent {
  if (doc.type === "doc") return doc
  return {
    type: "doc",
    content: Array.isArray(doc.content) ? doc.content : [],
  }
}

/** Action item titles from the "Action items" task list in a saved document. */
export function extractActionItemsFromDoc(
  doc: TiptapJSONContent
): MeetingActionItem[] {
  const root = normalizeTiptapDoc(doc)
  const content = root.content ?? []
  const target = "action items"
  let foundHeading = false
  const items: MeetingActionItem[] = []

  for (const node of content) {
    if (node.type === "heading" && node.attrs?.level === 2) {
      const label = node.content?.[0]?.text?.toLowerCase() ?? ""
      foundHeading = label.includes(target)
      continue
    }
    if (foundHeading && node.type === "taskList") {
      for (const taskItem of node.content ?? []) {
        const title = extractPlainTextFromDoc(taskItem)
        if (title) {
          items.push({ title, assigneeHint: null })
        }
      }
      break
    }
    if (foundHeading && node.type === "heading") {
      break
    }
  }

  return items
}

/**
 * Merge an edited Tiptap document into the persisted v2 summary shape,
 * preserving sentiment and refreshing action-item metadata from the doc.
 */
export function buildSummaryV2FromDocument(
  existing: {
    sentiment: MeetingSentiment
    actionItems: MeetingActionItem[]
  } | null,
  document: TiptapJSONContent
): MeetingSummaryV2 {
  const doc = normalizeTiptapDoc(document)
  const fromDoc = extractActionItemsFromDoc(doc)

  return {
    version: 2,
    doc,
    sentiment: existing?.sentiment ?? "neutral",
    actionItems: fromDoc.length > 0 ? fromDoc : (existing?.actionItems ?? []),
  }
}

export function buildSummaryV2FromStoredAndDocument(
  storedSummary: unknown,
  document: TiptapJSONContent
): MeetingSummaryV2 {
  const parsed = parseMeetingSummary(storedSummary)
  return buildSummaryV2FromDocument(parsed, document)
}
