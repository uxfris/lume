import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { MarketingSection } from "../marketing-section"
import { HOME_COPY } from "../../_lib/home-copy"
import { routes } from "@/lib/routes"

export function HomeIntegrationsTeaser() {
  const { integrations } = HOME_COPY

  return (
    <MarketingSection
      id="integrations"
      label={integrations.label}
      headline={integrations.headline}
      description={integrations.body}
      className="bg-muted/30"
    >
      <ul className="mx-auto grid max-w-2xl gap-4">
        {integrations.tools.map((tool) => (
          <li
            key={tool.name}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 md:p-5"
          >
            <Image src={tool.icon} alt="" width={40} height={40} className="size-10" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{tool.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  Available
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{tool.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center">
        <Link
          href={routes.marketing.integrations}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          {integrations.link}
          <ArrowRight className="size-4" />
        </Link>
      </p>
    </MarketingSection>
  )
}
