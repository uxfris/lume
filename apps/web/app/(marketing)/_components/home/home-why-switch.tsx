import { Check } from "lucide-react"
import { MarketingSection } from "../marketing-section"
import { HOME_COPY } from "../../_lib/home-copy"

export function HomeWhySwitch() {
  const { whySwitch } = HOME_COPY

  return (
    <MarketingSection
      label={whySwitch.label}
      headline={whySwitch.headline}
      description={whySwitch.body}
    >
      <ul className="mx-auto grid max-w-2xl gap-3">
        {whySwitch.outcomes.map((outcome) => (
          <li
            key={outcome}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>
    </MarketingSection>
  )
}
