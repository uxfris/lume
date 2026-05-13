"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Check } from "lucide-react"
import { type BillingUsageResponse } from "@workspace/types"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useCheckout } from "../_hooks/use-checkout"

const STUDIO_PRO_MONTHLY_PRICE = 25
const STUDIO_PRO_YEARLY_PRICE = STUDIO_PRO_MONTHLY_PRICE * 12 - 60

export function BillingPlan({ usage }: { usage: BillingUsageResponse | null }) {
  const { plans, isAnnual, setIsAnnual, checkoutBusy, upgradeStudioPro } =
    useCheckout(usage)
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const isStudioPro = plan.id === "studio-pro"
        const displayPrice =
          isStudioPro && isAnnual ? STUDIO_PRO_YEARLY_PRICE : plan.price
        const displayDescription =
          isStudioPro && isAnnual ? "Billed yearly" : plan.description

        return (
          <Card key={plan.id} className="py-8">
            <CardHeader className="px-8">
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 px-0">
              <div className="space-y-8">
                <div className="space-y-2 px-8">
                  <h2 className="text-4xl font-bold">
                    {displayPrice === 0
                      ? "Free"
                      : displayPrice !== "Custom"
                        ? `$${displayPrice}`
                        : displayPrice}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {displayDescription}
                  </p>
                </div>
                <div className="space-y-6">
                  {
                    <Separator
                      className={cn(
                        plan.id !== "studio-pro" && "hidden opacity-0 md:block"
                      )}
                    />
                  }
                  <div
                    className={cn(
                      "flex items-center gap-2 px-8",
                      plan.id !== "studio-pro" && "hidden opacity-0 md:block"
                    )}
                  >
                    <Switch
                      checked={isAnnual}
                      onCheckedChange={setIsAnnual}
                      disabled={plan.id !== "studio-pro" || checkoutBusy}
                    />
                    <span className="flex-1 text-sm font-medium">Annual</span>
                    <Badge>Save $60</Badge>
                  </div>
                  {
                    <Separator
                      className={cn(
                        plan.id !== "studio-pro" && "hidden md:block"
                      )}
                    />
                  }
                </div>
                <div className="px-8">
                  {plan.id === "studio-pro" ? (
                    <Button
                      disabled={
                        Boolean(plan.currentPlan) ||
                        checkoutBusy ||
                        plan.ctaDisabled
                      }
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        void upgradeStudioPro()
                      }}
                    >
                      {plan.currentPlan
                        ? "Current Plan"
                        : checkoutBusy
                          ? "Redirecting…"
                          : plan.ctaLabel}
                    </Button>
                  ) : (
                    <Button
                      disabled={plan.ctaDisabled}
                      variant="outline"
                      className="w-full"
                    >
                      {plan.currentPlan ? "Current Plan" : plan.ctaLabel}
                    </Button>
                  )}
                </div>
                <div className="space-y-4 px-8">
                  <ul className="space-y-4 text-sm font-medium">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
