import { z } from "zod"

/**
 * Pricing Plan Schema
 */

export const PricingPlanIdSchema = z.enum(["starter", "studio-pro", "business"])

export const PricingPlanSchema = z.object({
  id: PricingPlanIdSchema,
  name: z.string(),
  tagline: z.string(),
  price: z.union([z.number(), z.literal("Custom")]),
  billingPeriod: z.string().optional(),
  description: z.string(),
  features: z.array(z.string()),
  ctaLabel: z.string(),
  highlighted: z.boolean().default(false),
  /** Overridden in the billing UI from live `/billing` data. */
  currentPlan: z.boolean().optional(),
})

export const PricingPlansSchema = z.array(PricingPlanSchema)

/**
 * Type Inference
 */
export type PricingPlan = z.infer<typeof PricingPlanSchema>

/**
 * Pricing Data
 */
export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For focused individuals",
    price: 0,
    description: "Forever free",
    features: [
      "5 meetings/month",
      "~13 hours of recording storage",
      "AI Summaries & search",
      "Single workspace",
      "Email support",
    ],
    ctaLabel: "Starter Plan",
    highlighted: false,
  },
  {
    id: "studio-pro",
    name: "Studio Pro",
    tagline: "For daily meeting workflows",
    price: 25,
    billingPeriod: "per month",
    description: "Billed monthly",
    features: [
      "Unlimited meetings",
      "~2,000 hours of recordings",
      "AI meeting assistant",
      "Shared workspaces",
      "Priority support",
    ],
    ctaLabel: "Upgrade",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    tagline: "For scaling organizations",
    price: "Custom",
    description: "Billed annually",
    features: [
      "SSO & SAML",
      "Admin controls & governance",
      "SLA-backed support",
      "Dedicated onboarding",
      "Scalable storage",
    ],
    ctaLabel: "Book a demo",
    highlighted: false,
  },
]
