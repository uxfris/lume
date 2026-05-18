import { describe, expect, it } from "vitest"
import {
  buildSummaryV2FromDocument,
  buildTiptapDocFromAnalysis,
  buildTiptapDocFromLegacy,
  extractActionItemsFromDoc,
  extractBulletItemsAfterHeading,
  extractPlainTextFromDoc,
  parseMeetingSummary,
} from "@workspace/types"

const sampleAnalysis = {
  overview: "Team aligned on Q2 launch scope and resourcing.",
  keyTakeaways: ["Launch date is May 15", "Design review Friday"],
  topicsDiscussed: [
    {
      title: "Launch scope",
      summary: "MVP includes auth and billing only.",
    },
  ],
  decisions: ["Ship MVP without mobile"],
  openQuestions: ["Who owns QA sign-off?"],
  actionItems: [
    { title: "Send revised timeline", assigneeHint: "Alex" },
    { title: "Book design review", assigneeHint: null },
  ],
  sentiment: "positive" as const,
}

describe("buildTiptapDocFromAnalysis", () => {
  it("produces a doc with expected section headings", () => {
    const doc = buildTiptapDocFromAnalysis(sampleAnalysis)
    const headings =
      doc.content
        ?.filter((n) => n.type === "heading" && n.attrs?.level === 2)
        .map((n) => n.content?.[0]?.text) ?? []

    expect(headings).toEqual([
      "Overview",
      "Key takeaways",
      "Topics discussed",
      "Decisions",
      "Open questions",
      "Action items",
    ])
  })

  it("includes taskList for action items", () => {
    const doc = buildTiptapDocFromAnalysis(sampleAnalysis)
    const taskList = doc.content?.find((n) => n.type === "taskList")
    expect(taskList?.content?.length).toBe(2)
  })
})

describe("parseMeetingSummary", () => {
  it("reads v2 stored shape", () => {
    const doc = buildTiptapDocFromAnalysis(sampleAnalysis)
    const parsed = parseMeetingSummary({
      version: 2,
      doc,
      sentiment: "positive",
      actionItems: sampleAnalysis.actionItems,
    })
    expect(parsed?.doc.type).toBe("doc")
    expect(parsed?.sentiment).toBe("positive")
  })

  it("reads legacy shape", () => {
    const parsed = parseMeetingSummary({
      summary: "Short summary",
      keyPoints: ["Point A"],
      sentiment: "neutral",
      actionItems: [],
    })
    expect(parsed?.doc.type).toBe("doc")
    expect(extractPlainTextFromDoc(parsed!.doc)).toContain("Short summary")
  })
})

describe("buildSummaryV2FromDocument", () => {
  it("persists edited doc and extracts action items from task list", () => {
    const doc = buildTiptapDocFromAnalysis(sampleAnalysis)
    const stored = buildSummaryV2FromDocument(
      { sentiment: "positive", actionItems: [] },
      doc
    )
    expect(stored.version).toBe(2)
    expect(stored.doc.type).toBe("doc")
    expect(stored.actionItems.length).toBe(2)
    expect(extractActionItemsFromDoc(stored.doc).map((a) => a.title)).toEqual([
      "Send revised timeline",
      "Book design review",
    ])
  })
})

describe("extractBulletItemsAfterHeading", () => {
  it("returns key takeaway bullets from doc", () => {
    const doc = buildTiptapDocFromLegacy({
      summary: "Overview text",
      keyPoints: ["One", "Two"],
      sentiment: "neutral",
      actionItems: [],
    })
    const items = extractBulletItemsAfterHeading(doc, "key takeaways")
    expect(items).toEqual(["One", "Two"])
  })
})
