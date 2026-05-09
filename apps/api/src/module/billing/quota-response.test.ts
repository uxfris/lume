import { describe, expect, it } from "vitest"
import { buildQuotaExceededBody } from "./quota-response"
import { starterPlanLimits } from "@workspace/types"

describe("buildQuotaExceededBody", () => {
  it("includes period in YYYY-MM format", () => {
    const body = buildQuotaExceededBody({
      reason: "minutes",
      usedMinutes: 305,
      usedMeetings: 12,
    })
    expect(body.period).toMatch(/^\d{4}-\d{2}$/)
  })

  it("returns starter plan limits and the right message for minutes overage", () => {
    const body = buildQuotaExceededBody({
      reason: "minutes",
      usedMinutes: 305,
      usedMeetings: 5,
    })

    expect(body.error).toBe("QUOTA_EXCEEDED")
    expect(body.limitMinutes).toBe(starterPlanLimits.minutesPerMonth)
    expect(body.limitMeetings).toBe(starterPlanLimits.meetingsPerMonth)
    expect(body.usedMinutes).toBe(305)
    expect(body.message).toMatch(/transcription minutes/i)
  })

  it("returns the meetings-overage message when reason is 'meetings'", () => {
    const body = buildQuotaExceededBody({
      reason: "meetings",
      usedMinutes: 1,
      usedMeetings: 6,
    })
    expect(body.message).toMatch(/included meetings/i)
    expect(body.detail).toBe(body.message)
  })
})
