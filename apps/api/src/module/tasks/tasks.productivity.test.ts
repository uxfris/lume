import { describe, expect, it } from "vitest"
import {
  buildTaskProductivityStats,
  completionPacePercent,
  partitionCompletedByWeek,
} from "./tasks.productivity"

const now = new Date("2026-05-18T12:00:00.000Z")

function daysAgo(days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

describe("partitionCompletedByWeek", () => {
  it("splits tasks into rolling seven-day windows", () => {
    const partitioned = partitionCompletedByWeek(
      [
        { createdAt: daysAgo(8), updatedAt: daysAgo(1) },
        { createdAt: daysAgo(10), updatedAt: daysAgo(9) },
      ],
      now
    )

    expect(partitioned.thisWeek).toHaveLength(1)
    expect(partitioned.lastWeek).toHaveLength(1)
  })
})

describe("completionPacePercent", () => {
  it("returns a positive value when tasks are completed faster this week", () => {
    const pace = completionPacePercent(
      [{ createdAt: daysAgo(2), updatedAt: daysAgo(1) }],
      [{ createdAt: daysAgo(12), updatedAt: daysAgo(8) }]
    )

    expect(pace).toBeGreaterThan(0)
  })

  it("returns null when either week has no completions", () => {
    expect(completionPacePercent([], [{ createdAt: daysAgo(9), updatedAt: daysAgo(8) }])).toBeNull()
  })
})

describe("buildTaskProductivityStats", () => {
  it("returns null when there is no task history", () => {
    expect(
      buildTaskProductivityStats({
        created: 0,
        resolved: 0,
        recentCompleted: [],
        now,
      })
    ).toBeNull()
  })

  it("returns totals and pace when enough completion history exists", () => {
    const stats = buildTaskProductivityStats({
      created: 32,
      resolved: 14,
      recentCompleted: [
        { createdAt: daysAgo(3), updatedAt: daysAgo(1) },
        { createdAt: daysAgo(12), updatedAt: daysAgo(9) },
      ],
      now,
    })

    expect(stats).toEqual({
      created: 32,
      resolved: 14,
      pacePercent: expect.any(Number),
    })
  })
})
