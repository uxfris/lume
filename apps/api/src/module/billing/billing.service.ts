import { utcBillingPeriod } from "@workspace/database"
import type { Workspace } from "@workspace/database"
import {
  starterPlanLimits,
  type BillingCheckoutBody,
  type BillingPlanId,
  type BillingUsageResponse,
} from "@workspace/types"
import { getStripe } from "../../lib/stripe"
import * as billingRepo from "./billing.repo"
import { env } from "../../config/env"

function planToApi(plan: Workspace["plan"]): BillingPlanId {
  return plan === "STUDIO_PRO" ? "studio-pro" : "starter"
}

export async function getBillingForWorkspace(
  workspace: Workspace
): Promise<BillingUsageResponse> {
  const period = utcBillingPeriod()
  const row = await billingRepo.findUsageCounter(workspace.id, period)
  const isStarter = workspace.plan === "STARTER"

  return {
    plan: planToApi(workspace.plan),
    period,
    minutesUsed: row?.minutesTranscribed ?? 0,
    minutesLimit: isStarter ? starterPlanLimits.minutesPerMonth : null,
    meetingsUsed: row?.meetingsTranscribed ?? 0,
    meetingsLimit: isStarter ? starterPlanLimits.meetingsPerMonth : null,
    subscriptionRenewsAt: workspace.subscriptionPeriodEnd
      ? workspace.subscriptionPeriodEnd.toISOString()
      : null,
  }
}

export async function createStudioProCheckoutSession(input: {
  workspace: Workspace
  userId: string
  userEmail: string
  billingPeriod: BillingCheckoutBody["billingPeriod"]
}): Promise<
  { ok: true; url: string } | { ok: false; error: "STRIPE_NOT_CONFIGURED" }
> {
  const stripe = getStripe()
  const priceId =
    input.billingPeriod === "yearly"
      ? env.STRIPE_PRICE_ID_STUDIO_PRO_YEARLY
      : env.STRIPE_PRICE_ID_STUDIO_PRO_MONTHLY
  const frontendUrl = env.FRONTEND_URL

  if (!stripe || !priceId || !frontendUrl) {
    return { ok: false, error: "STRIPE_NOT_CONFIGURED" }
  }

  const successUrl = `${frontendUrl.replace(/\/$/, "")}/settings/billing?checkout=success`
  const cancelUrl = `${frontendUrl.replace(/\/$/, "")}/settings/billing?checkout=canceled`

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: input.workspace.id,
    customer: input.workspace.stripeCustomerId ?? undefined,
    customer_email:
      input.workspace.stripeCustomerId == null ? input.userEmail : undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    metadata: {
      workspaceId: input.workspace.id,
      userId: input.userId,
      billingPeriod: input.billingPeriod,
    },
    subscription_data: {
      metadata: {
        workspaceId: input.workspace.id,
        billingPeriod: input.billingPeriod,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  if (!session.url) {
    return { ok: false, error: "STRIPE_NOT_CONFIGURED" }
  }

  return { ok: true, url: session.url }
}
