import { describe, expect, it } from "vitest"
import {
  buildTaskAIInsight,
  buildUrgentContexts,
  confidenceFromScore,
  countMentions,
  scoreTaskRelevance,
} from "./tasks.insight"

describe("scoreTaskRelevance", () => {
  it("scores higher when task tokens appear in summary and key points", () => {
    const score = scoreTaskRelevance(
      "Client Billing Updates",
      "Discussed billing changes for enterprise clients.",
      ["Latency lag in billing pipeline", "Roadmap refine next week"]
    )

    expect(score).toBeGreaterThan(0)
    expect(
      scoreTaskRelevance("Unrelated housekeeping", "Discussed billing changes", [
        "Latency lag",
      ])
    ).toBeLessThan(score)
  })
})

describe("confidenceFromScore", () => {
  it("maps the top score to a bounded confidence range", () => {
    expect(confidenceFromScore(4, 4)).toBeGreaterThanOrEqual(90)
    expect(confidenceFromScore(1, 4)).toBeLessThan(confidenceFromScore(4, 4))
  })
})

describe("countMentions", () => {
  it("counts segments that mention the label or most keywords", () => {
    const segments = [
      "We saw latency lag again in production.",
      "The roadmap refine is next week.",
      "Latency lag came up during QA.",
    ]

    expect(countMentions("Latency Lag", segments)).toBe(2)
  })
})

describe("buildUrgentContexts", () => {
  it("includes mention counts only when repeated", () => {
    const contexts = buildUrgentContexts(
      ["Latency Lag", "Marcus Q3 feedback"],
      [
        "Latency lag is blocking release.",
        "Marcus shared Q3 feedback in the doc.",
        "Another latency lag spike today.",
      ]
    )

    expect(contexts[0]).toEqual({ label: "Latency Lag", mentionCount: 2 })
    expect(contexts[1]).toEqual({ label: "Marcus Q3 feedback" })
  })
})

describe("buildTaskAIInsight", () => {
  it("returns null when there are no open tasks", () => {
    expect(
      buildTaskAIInsight({
        meetingTitle: "Quarterly Forecast",
        meetingUpdatedAt: new Date("2026-05-17T12:00:00.000Z"),
        summary: {
          summary: "Forecast review",
          keyPoints: ["Latency lag"],
        },
        openTasks: [],
        transcriptSegments: ["Latency lag again"],
      })
    ).toBeNull()
  })

  it("builds a prioritized insight payload", () => {
    const insight = buildTaskAIInsight({
      meetingTitle: "Quarterly Forecast",
      meetingUpdatedAt: new Date("2026-05-17T12:00:00.000Z"),
      summary: {
        summary: "Discussed billing updates and roadmap refine.",
        keyPoints: ["Latency Lag", "Marcus Q3 feedback"],
      },
      openTasks: [
        { id: "1", title: "Client Billing Updates" },
        { id: "2", title: "Roadmap refine" },
      ],
      transcriptSegments: [
        "Billing updates must ship first.",
        "Latency lag is still open.",
        "Latency lag blocked QA again.",
      ],
    })

    expect(insight).not.toBeNull()
    expect(insight?.meetingTitle).toBe("Quarterly Forecast")
    expect(insight?.recommendedTaskTitle).toBe("Client Billing Updates")
    expect(insight?.alternateTaskTitle).toBe("Roadmap refine")
    expect(insight?.urgentContexts[0]?.mentionCount).toBe(2)
  })
})
