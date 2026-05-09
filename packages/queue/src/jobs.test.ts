import { describe, expect, it } from "vitest"
import { QueueName } from "./jobs"
import { CONSERVATIVE_DEFAULT_JOB_OPTIONS } from "./queue"

describe("QueueName registry", () => {
  it("exposes the five Phase-3+ queue names", () => {
    expect(Object.values(QueueName).sort()).toEqual(
      [
        "transcribe",
        "diarize",
        "analyze",
        "embed",
        "import-bot-transcript",
      ].sort()
    )
  })
})

describe("CONSERVATIVE_DEFAULT_JOB_OPTIONS", () => {
  it("uses 2 attempts with exponential backoff (Phase 3 gotcha)", () => {
    expect(CONSERVATIVE_DEFAULT_JOB_OPTIONS.attempts).toBe(2)
    expect(CONSERVATIVE_DEFAULT_JOB_OPTIONS.backoff).toEqual({
      type: "exponential",
      delay: 60_000,
    })
  })

  it("removes completed jobs after 24h and failed jobs after 7d", () => {
    const removeOnComplete = CONSERVATIVE_DEFAULT_JOB_OPTIONS.removeOnComplete
    const removeOnFail = CONSERVATIVE_DEFAULT_JOB_OPTIONS.removeOnFail

    expect(removeOnComplete).toMatchObject({ age: 24 * 3600 })
    expect(removeOnFail).toMatchObject({ age: 7 * 24 * 3600 })
  })
})
