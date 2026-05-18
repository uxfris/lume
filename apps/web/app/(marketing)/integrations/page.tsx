import type { Metadata } from "next"
import { routes } from "@/lib/routes"
import { MarketingShell } from "../_components/marketing-shell"
import { MarketingPageHero } from "../_components/marketing-page-hero"
import {
  IntegrationsAvailableSection,
  IntegrationsComingSoonSection,
  IntegrationsFinalCta,
  IntegrationsHowItWorksSection,
} from "../_components/integrations/integrations-sections"
import { INTEGRATIONS_COPY } from "../_lib/integrations-copy"

export const metadata: Metadata = {
  title: "Integrations — Slack & Linear | Lume",
  description:
    "Push meeting summaries to Slack and action items to Linear. Connect after signup.",
  openGraph: {
    title: "Connect meetings to where work happens | Lume",
    description: "Slack and Linear integrations available today. More tools on the way.",
    type: "website",
  },
}

export default function IntegrationsPage() {
  const { hero } = INTEGRATIONS_COPY

  return (
    <MarketingShell>
      <MarketingPageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subhead={hero.subhead}
        ctaPrimary={{ label: hero.cta, href: routes.authentication }}
      />

      <IntegrationsAvailableSection />
      <IntegrationsComingSoonSection />
      <IntegrationsHowItWorksSection />
      <IntegrationsFinalCta />
    </MarketingShell>
  )
}
