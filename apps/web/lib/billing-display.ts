import type { BillingUsageResponse } from "@workspace/types"
import { starterPlanLimits } from "@workspace/types"

export function formatPlanLabel(plan: BillingUsageResponse["plan"]) {
  return plan === "studio-pro" ? "Studio Pro" : "Starter"
}

export function daysUntilUtcMonthEnd(now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000))
}

export function meetingsCreditsLeft(usage: BillingUsageResponse) {
  if (usage.meetingsLimit == null) return null
  return Math.max(0, usage.meetingsLimit - usage.meetingsUsed)
}

export function meetingsProgressPercent(usage: BillingUsageResponse) {
  if (usage.meetingsLimit == null || usage.meetingsLimit <= 0) return 0
  return Math.min(
    100,
    Math.round((usage.meetingsUsed / usage.meetingsLimit) * 100)
  )
}

export function meetingsCreditsSummary(usage: BillingUsageResponse | null) {
  if (!usage || usage.meetingsLimit == null) {
    return {
      left: null as number | null,
      used: 0,
      limit: starterPlanLimits.meetingsPerMonth,
      progress: 0,
    }
  }
  return {
    left: meetingsCreditsLeft(usage),
    used: usage.meetingsUsed,
    limit: usage.meetingsLimit,
    progress: meetingsProgressPercent(usage),
  }
}

export function creditsResetLabel(
  usage: BillingUsageResponse | null,
  daysUntilReset: number
) {
  if (usage?.subscriptionRenewsAt) {
    const renews = new Date(usage.subscriptionRenewsAt)
    const daysUntilRenewal = Math.max(
      0,
      Math.ceil((renews.getTime() - Date.now()) / 86_400_000)
    )
    if (daysUntilRenewal <= 30) {
      return `Subscription renews in ${daysUntilRenewal} ${daysUntilRenewal === 1 ? "day" : "days"}`
    }
    return `Renews ${renews.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
  }
  return `Monthly credits reset in ${daysUntilReset} ${daysUntilReset === 1 ? "day" : "days"}`
}
