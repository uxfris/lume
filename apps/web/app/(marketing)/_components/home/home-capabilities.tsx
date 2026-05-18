import {
  CheckSquare,
  FileText,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { MarketingSection } from "../marketing-section"
import { HOME_COPY } from "../../_lib/home-copy"

const CAPABILITY_ICONS = [Zap, FileText, Sparkles, CheckSquare, Search, Users] as const

export function HomeCapabilities() {
  const { capabilities } = HOME_COPY

  return (
    <MarketingSection
      id="what-you-get"
      label={capabilities.label}
      headline={capabilities.headline}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.items.map((item, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Zap
          return (
            <li
              key={item.title}
              className="rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/30"
            >
              <Icon className="size-5 text-primary" />
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </li>
          )
        })}
      </ul>
    </MarketingSection>
  )
}
