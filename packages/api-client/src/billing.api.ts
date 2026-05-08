import {
  BillingCheckoutBodySchema,
  BillingCheckoutResponseSchema,
  BillingPortalResponseSchema,
  BillingUsageResponseSchema,
  type BillingCheckoutBody,
  type BillingCheckoutResponse,
  type BillingPortalResponse,
  type BillingUsageResponse,
} from "@workspace/types"

import { client } from "./client"
import type { RequestOptions } from "./client"

export const billingApi = {
  async getBilling(
    options?: RequestOptions
  ): Promise<BillingUsageResponse> {
    const raw = await client.get<unknown>("/billing", options)
    return BillingUsageResponseSchema.parse(raw)
  },

  async createStudioProCheckout(
    body: BillingCheckoutBody = { billingPeriod: "monthly" },
    options?: RequestOptions
  ): Promise<BillingCheckoutResponse> {
    const parsedBody = BillingCheckoutBodySchema.parse(body)
    const raw = await client.post<unknown>(
      "/billing/checkout",
      parsedBody,
      options
    )
    return BillingCheckoutResponseSchema.parse(raw)
  },

  async createBillingPortalSession(
    options?: RequestOptions
  ): Promise<BillingPortalResponse> {
    const raw = await client.post<unknown>("/billing/portal", {}, options)
    return BillingPortalResponseSchema.parse(raw)
  },
}
