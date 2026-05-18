export const PRICING_COPY = {
  hero: {
    eyebrow: "Pricing",
    headline: "Simple plans. No per-seat surprises.",
    subhead:
      "Try the full pipeline on Starter. Upgrade when meetings are part of your daily rhythm.",
    annualLabel: "Annual",
    annualBadge: "Save $60",
  },
  compare: {
    label: "Compare plans",
    headline: "What's included",
    footnote:
      "Limits reflect current plan configuration and may be updated. See Terms for billing details.",
    rows: [
      { label: "Meetings / month", starter: "5", pro: "Unlimited", business: "Custom" },
      {
        label: "Recording storage",
        starter: "~13 hours",
        pro: "~2,000 hours",
        business: "Custom",
      },
      {
        label: "AI summaries & search",
        starter: true,
        pro: true,
        business: true,
      },
      { label: "Live Sync bot", starter: true, pro: true, business: true },
      { label: "Shared workspaces", starter: false, pro: true, business: true },
      { label: "Priority support", starter: false, pro: true, business: true },
      { label: "SSO / SAML", starter: false, pro: false, business: true },
    ],
  },
  faq: {
    label: "Billing FAQ",
    headline: "Billing questions",
    items: [
      {
        question: "Do I need a credit card for Starter?",
        answer: "No. Starter is free to start.",
      },
      {
        question: "What happens when I hit 5 meetings on Starter?",
        answer:
          "You'll need to wait until the next cycle or upgrade to Studio Pro for unlimited meetings.",
      },
      {
        question: "Can I upgrade or downgrade anytime?",
        answer: "Yes. Changes apply per our billing terms.",
      },
      {
        question: "Is Studio Pro priced per user?",
        answer: "Studio Pro is a flat workspace price — not per seat.",
      },
      {
        question: "How do I get Business pricing?",
        answer:
          "Book a demo and we'll tailor a plan for your organization.",
      },
    ],
  },
  finalCta: {
    headline: "Start with five meetings on us.",
    cta: "Start free",
    reassurance: "No credit card required",
  },
  businessDemoEmail: "legal@lume.ai",
} as const

export const STUDIO_PRO_MONTHLY_PRICE = 25
export const STUDIO_PRO_YEARLY_PRICE = STUDIO_PRO_MONTHLY_PRICE * 12 - 60
