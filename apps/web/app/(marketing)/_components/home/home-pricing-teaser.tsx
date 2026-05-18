import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { routes } from "@/lib/routes"
import { MarketingSection } from "../marketing-section"
import { HOME_COPY } from "../../_lib/home-copy"

export function HomePricingTeaser() {
  const { pricing } = HOME_COPY

  return (
    <MarketingSection
      id="pricing"
      label={pricing.label}
      headline={pricing.headline}
    >
      <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>{pricing.starter.name}</CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {pricing.starter.price}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{pricing.starter.detail}</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href={routes.authentication}>Start free</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{pricing.pro.name}</CardTitle>
              <Badge>Most popular</Badge>
            </div>
            <CardDescription className="text-2xl font-semibold text-foreground">
              {pricing.pro.price}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{pricing.pro.detail}</p>
            <Button className="w-full" asChild>
              <Link href={routes.authentication}>Upgrade</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center">
        <Link
          href={routes.marketing.pricing}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          {pricing.link}
          <ArrowRight className="size-4" />
        </Link>
      </p>
    </MarketingSection>
  )
}
