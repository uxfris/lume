import { describe, expect, it } from "vitest"
import {
  transcribedMinutesFromDuration,
  utcBillingPeriod,
} from "@workspace/database"

describe("utcBillingPeriod", () => {
  it("formats a January date", () => {
    const date = new Date(Date.UTC(2026, 0, 15, 12, 0, 0))
    expect(utcBillingPeriod(date)).toBe("2026-01")
  })

  it("zero-pads single-digit months", () => {
    const date = new Date(Date.UTC(2026, 8, 1, 0, 0, 0))
    expect(utcBillingPeriod(date)).toBe("2026-09")
  })

  it("uses UTC, not local time", () => {
    // 11:30 PM UTC on Jan 31 -> still Jan in UTC
    const date = new Date("2026-01-31T23:30:00.000Z")
    expect(utcBillingPeriod(date)).toBe("2026-01")
  })
})

describe("transcribedMinutesFromDuration", () => {
  it("returns 1 for null/undefined/zero (we always charge at least one minute)", () => {
    expect(transcribedMinutesFromDuration(null)).toBe(1)
    expect(transcribedMinutesFromDuration(undefined)).toBe(1)
    expect(transcribedMinutesFromDuration(0)).toBe(1)
    expect(transcribedMinutesFromDuration(-5)).toBe(1)
  })

  it("rounds up partial minutes", () => {
    expect(transcribedMinutesFromDuration(1)).toBe(1)
    expect(transcribedMinutesFromDuration(60)).toBe(1)
    expect(transcribedMinutesFromDuration(61)).toBe(2)
    expect(transcribedMinutesFromDuration(120)).toBe(2)
    expect(transcribedMinutesFromDuration(121)).toBe(3)
  })
})
