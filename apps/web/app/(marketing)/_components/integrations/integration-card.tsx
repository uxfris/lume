import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Integration } from "@workspace/types"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { routes } from "@/lib/routes"

type IntegrationCardProps = {
  integration: Integration
  variant: "available" | "coming-soon"
  ctaLabel?: string
}

export function IntegrationCard({
  integration,
  variant,
  ctaLabel = "Connect in app",
}: IntegrationCardProps) {
  const isAvailable = variant === "available"

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border/60 bg-card p-5 md:p-6",
        isAvailable && "transition-colors hover:border-primary/30",
        !isAvailable && "opacity-75"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <Image
          src={integration.logo}
          alt=""
          width={48}
          height={48}
          className="size-12"
        />
        <Badge variant={isAvailable ? "default" : "secondary"}>
          {isAvailable ? "Available" : "Coming soon"}
        </Badge>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs text-muted-foreground">{integration.category}</p>
        <h3 className="mt-1 text-lg font-semibold">{integration.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {integration.description}
        </p>

        {isAvailable ? (
          <Button variant="outline" className="mt-6 w-full gap-2" asChild>
            <Link href={routes.authentication}>
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  )
}
