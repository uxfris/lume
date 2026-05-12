import { prisma } from "@workspace/database"
import type Stripe from "stripe"
import { getStripe } from "../../lib/stripe"

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
])

const INACTIVE_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
  "canceled",
  "unpaid",
  "incomplete_expired",
  "paused",
])

function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): Date | null {
  const itemEnd = subscription.items.data.reduce<number | null>((max, item) => {
    const value = item.current_period_end
    if (typeof value !== "number") return max
    if (max == null) return value
    return value > max ? value : max
  }, null)

  return itemEnd != null ? new Date(itemEnd * 1000) : null
}

export async function processStripeWebhookEvent(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      )
      break
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
    default:
      break
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  if (session.mode !== "subscription") return
  const workspaceId = session.metadata?.workspaceId
  if (!workspaceId || !session.subscription) return

  const stripe = getStripe()
  if (!stripe) return

  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id

  const subscription = await stripe.subscriptions.retrieve(subId)
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id
  const periodEnd = getSubscriptionPeriodEnd(subscription)

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      plan: "STUDIO_PRO",
      stripeSubscriptionId: subscription.id,
      ...(periodEnd ? { subscriptionPeriodEnd: periodEnd } : {}),
      ...(customerId ? { stripeCustomerId: customerId } : {}),
    },
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const workspace = await prisma.workspace.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })
  if (!workspace) return

  if (ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
    const periodEnd = getSubscriptionPeriodEnd(subscription)

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        plan: "STUDIO_PRO",
        ...(periodEnd ? { subscriptionPeriodEnd: periodEnd } : {}),
      },
    })
    return
  }

  if (INACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        plan: "STARTER",
        stripeSubscriptionId: null,
        subscriptionPeriodEnd: null,
      },
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.workspace.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan: "STARTER",
      stripeSubscriptionId: null,
      subscriptionPeriodEnd: null,
    },
  })
}
