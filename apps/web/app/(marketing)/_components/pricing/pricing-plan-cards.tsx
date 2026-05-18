"use client"

import Link from "next/link"
import { pricingPlans, type PricingPlan } from "@workspace/types"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Switch } from "@workspace/ui/components/switch"
import { cn } from "@workspace/ui/lib/utils"
import { Check } from "lucide-react"
import { useState } from "react"
import { routes } from "@/lib/routes"
import {
  PRICING_COPY,
  STUDIO_PRO_MONTHLY_PRICE,
  STUDIO_PRO_YEARLY_PRICE,
} from "../../_lib/pricing-copy"

function formatPrice(plan: PricingPlan, isAnnual: boolean) {
  if (plan.price === "Custom") return "Custom"
  if (plan.price === 0) return "$0"

  if (plan.id === "studio-pro") {
    return isAnnual ? `$${STUDIO_PRO_YEARLY_PRICE}` : `$${STUDIO_PRO_MONTHLY_PRICE}`
  }

  return `$${plan.price}`
}

function formatPeriod(plan: PricingPlan, isAnnual: boolean) {
  if (plan.id === "starter") return plan.description
  if (plan.id === "studio-pro") {
    return isAnnual ? "Billed yearly" : "per month"
  }
  return "Talk to us"
}

function planCtaHref(plan: PricingPlan) {
  if (plan.id === "business") {
    return `mailto:${PRICING_COPY.businessDemoEmail}?subject=Lume%20Business%20demo`
  }
  return routes.authentication
}

function planCtaLabel(plan: PricingPlan) {
  if (plan.id === "starter") return "Start free"
  if (plan.id === "studio-pro") return "Upgrade"
  return plan.ctaLabel
}

export function PricingPlanCards() {
  const [isAnnual, setIsAnnual] = useState(false)
  const { hero } = PRICING_COPY

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-3">
        <Switch
          id="billing-annual"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <label
          htmlFor="billing-annual"
          className="cursor-pointer text-sm font-medium"
        >
          {hero.annualLabel}
        </label>
        <Badge variant="secondary">{hero.annualBadge}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => {
          const highlighted = plan.highlighted
          const isStudioPro = plan.id === "studio-pro"

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                highlighted &&
                  "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 lg:scale-[1.02]"
              )}
            >
              {highlighted ? (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              ) : null}

              <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-6">
                <div>
                  <p className="text-4xl font-bold tracking-tight">
                    {formatPrice(plan, isAnnual)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatPeriod(plan, isAnnual)}
                  </p>
                </div>

                <Button
                  variant={highlighted ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link href={planCtaHref(plan)}>{planCtaLabel(plan)}</Link>
                </Button>

                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isStudioPro && isAnnual ? (
                  <p className="mt-auto text-xs text-muted-foreground">
                    ${STUDIO_PRO_MONTHLY_PRICE}/mo equivalent · Save $60 vs monthly
                  </p>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Studio Pro is a flat workspace price — not per seat.
      </p>
    </div>
  )
}
