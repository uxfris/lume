import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"
import { MarketingSection } from "../marketing-section"
import {
  availableIntegrations,
  comingSoonIntegrations,
} from "../../_lib/integrations-catalog"
import { INTEGRATIONS_COPY } from "../../_lib/integrations-copy"
import { IntegrationCard } from "./integration-card"

export function IntegrationsAvailableSection() {
  const { available } = INTEGRATIONS_COPY

  return (
    <MarketingSection label={available.label} headline={available.headline}>
      <ul className="grid gap-6 md:grid-cols-2">
        {availableIntegrations.map((integration) => (
          <li key={integration.id}>
            <IntegrationCard
              integration={integration}
              variant="available"
              ctaLabel={available.cta}
            />
          </li>
        ))}
      </ul>
    </MarketingSection>
  )
}

export function IntegrationsComingSoonSection() {
  const { comingSoon } = INTEGRATIONS_COPY

  return (
    <MarketingSection
      label={comingSoon.label}
      headline={comingSoon.headline}
      description={comingSoon.subhead}
      className="bg-muted/30"
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {comingSoonIntegrations.map((integration) => (
          <li key={integration.id}>
            <IntegrationCard integration={integration} variant="coming-soon" />
          </li>
        ))}
      </ul>
    </MarketingSection>
  )
}

export function IntegrationsHowItWorksSection() {
  const { howItWorks } = INTEGRATIONS_COPY

  return (
    <MarketingSection label={howItWorks.label} headline={howItWorks.headline}>
      <ol className="grid gap-6 md:grid-cols-3">
        {howItWorks.steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-border/60 bg-card p-6"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </span>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </MarketingSection>
  )
}

export function IntegrationsFinalCta() {
  const { finalCta } = INTEGRATIONS_COPY

  return (
    <section className="border-t border-border/60 bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          {finalCta.headline}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          {finalCta.subhead}
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href={routes.authentication}>{finalCta.cta}</Link>
        </Button>
      </div>
    </section>
  )
}
