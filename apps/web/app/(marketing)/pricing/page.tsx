import type { Metadata } from "next"
import { MarketingShell } from "../_components/marketing-shell"
import { MarketingPageHero } from "../_components/marketing-page-hero"
import { MarketingFaq } from "../_components/marketing-faq"
import { PricingCompareTable } from "../_components/pricing/pricing-compare-table"
import { PricingFinalCta } from "../_components/pricing/pricing-final-cta"
import { PricingPlanCards } from "../_components/pricing/pricing-plan-cards"
import { routes } from "@/lib/routes"
import { PRICING_COPY } from "../_lib/pricing-copy"

export const metadata: Metadata = {
  title: "Pricing — Free Starter & Studio Pro | Lume",
  description:
    "Start free with 5 meetings/month. Upgrade to Studio Pro for unlimited meetings and shared workspaces. Flat $25/mo.",
  openGraph: {
    title: "Simple plans. No per-seat surprises. | Lume",
    description: "Starter is free. Studio Pro is $25/mo flat for your workspace.",
    type: "website",
  },
}

export default function PricingPage() {
  const { hero, faq } = PRICING_COPY

  return (
    <MarketingShell>
      <MarketingPageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subhead={hero.subhead}
        ctaPrimary={{ label: "Start free", href: routes.authentication }}
      />

      <section className="pb-8 md:pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <PricingPlanCards />
        </div>
      </section>

      <PricingCompareTable />
      <MarketingFaq
        label={faq.label}
        headline={faq.headline}
        items={faq.items}
      />
      <PricingFinalCta />
    </MarketingShell>
  )
}
