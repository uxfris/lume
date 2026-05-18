import { MarketingSection } from "../marketing-section"
import { HOME_COPY } from "../../_lib/home-copy"

export function HomeHowItWorks() {
  const { howItWorks } = HOME_COPY

  return (
    <MarketingSection
      id="how-it-works"
      label={howItWorks.label}
      headline={howItWorks.headline}
      className="bg-muted/30"
    >
      <ol className="grid gap-6 md:grid-cols-3">
        {howItWorks.steps.map((step, index) => (
          <li
            key={step.title}
            className="relative rounded-xl border border-border/60 bg-card p-6"
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
