import { z } from "zod"

/** Starter tier caps (see docs/backend-plan.md phase 11). */
export const starterPlanLimits = {
  minutesPerMonth: 300,
  meetingsPerMonth: 5,
} as const

export const BillingPlanIdSchema = z.enum(["starter", "studio-pro"])

export type BillingPlanId = z.infer<typeof BillingPlanIdSchema>

export const BillingUsageResponseSchema = z.object({
  plan: BillingPlanIdSchema,
  period: z.string(),
  minutesUsed: z.number(),
  minutesLimit: z.number().nullable(),
  meetingsUsed: z.number(),
  meetingsLimit: z.number().nullable(),
  subscriptionRenewsAt: z.string().nullable(),
})

export type BillingUsageResponse = z.infer<typeof BillingUsageResponseSchema>

export const BillingCheckoutResponseSchema = z.object({
  url: z.string().url(),
})

export type BillingCheckoutResponse = z.infer<
  typeof BillingCheckoutResponseSchema
>

export const BillingCheckoutBodySchema = z.object({
  billingPeriod: z.enum(["monthly", "yearly"]).default("monthly"),
})

export type BillingCheckoutBody = z.infer<typeof BillingCheckoutBodySchema>

export const QuotaExceededBodySchema = z.object({
  error: z.literal("QUOTA_EXCEEDED"),
  message: z.string(),
  detail: z.string(),
  period: z.string(),
  usedMinutes: z.number(),
  limitMinutes: z.number(),
  usedMeetings: z.number(),
  limitMeetings: z.number(),
})

export type QuotaExceededBody = z.infer<typeof QuotaExceededBodySchema>
