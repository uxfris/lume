import {
  starterPlanLimits,
  type QuotaExceededBody,
} from "@workspace/types"
import { utcBillingPeriod } from "@workspace/database"

export function buildQuotaExceededBody(input: {
  usedMinutes: number
  usedMeetings: number
  reason: "minutes" | "meetings"
}): QuotaExceededBody {
  const period = utcBillingPeriod()
  const message =
    input.reason === "minutes"
      ? `You have used all ${starterPlanLimits.minutesPerMonth} included transcription minutes for ${period}. Upgrade to Studio Pro for unlimited meetings.`
      : `You have reached the ${starterPlanLimits.meetingsPerMonth} included meetings for ${period} on the Starter plan. Upgrade to Studio Pro to continue.`

  return {
    error: "QUOTA_EXCEEDED",
    message,
    detail: message,
    period,
    usedMinutes: input.usedMinutes,
    limitMinutes: starterPlanLimits.minutesPerMonth,
    usedMeetings: input.usedMeetings,
    limitMeetings: starterPlanLimits.meetingsPerMonth,
  }
}
