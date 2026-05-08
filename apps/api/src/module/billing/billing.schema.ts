import {
  BillingCheckoutBodySchema,
  BillingCheckoutResponseSchema,
  BillingPortalResponseSchema,
  BillingUsageResponseSchema,
  QuotaExceededBodySchema,
} from "@workspace/types"

export const billingUsageResponseSchema = BillingUsageResponseSchema

export const billingCheckoutResponseSchema = BillingCheckoutResponseSchema
export const billingCheckoutBodySchema = BillingCheckoutBodySchema
export const billingPortalResponseSchema = BillingPortalResponseSchema

export const quotaExceededResponseSchema = QuotaExceededBodySchema
