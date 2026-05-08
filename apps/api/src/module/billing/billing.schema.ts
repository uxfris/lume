import {
  BillingCheckoutBodySchema,
  BillingCheckoutResponseSchema,
  BillingUsageResponseSchema,
  QuotaExceededBodySchema,
} from "@workspace/types"

export const billingUsageResponseSchema = BillingUsageResponseSchema

export const billingCheckoutResponseSchema = BillingCheckoutResponseSchema
export const billingCheckoutBodySchema = BillingCheckoutBodySchema

export const quotaExceededResponseSchema = QuotaExceededBodySchema
