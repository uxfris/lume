"use client"

import {
  pricingPlans,
  type BillingCheckoutBody,
  type BillingPlanId,
  BillingUsageResponse,
} from "@workspace/types"
import { billingApi } from "@workspace/api-client"
import { useMemo, useState } from "react"

function resolvePlansWithCurrent(active: BillingPlanId | null) {
  return pricingPlans.map((p) => ({
    ...p,
    currentPlan: p.id === active,
    ctaDisabled: p.price === "Custom" || p.id === active,
  }))
}

export function useCheckout(usage: BillingUsageResponse | null) {
  const activePlan = usage?.plan ?? null

  const plans = useMemo(() => resolvePlansWithCurrent(activePlan), [activePlan])

  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)

  async function upgradeStudioPro() {
    if (checkoutBusy) return

    setCheckoutBusy(true)

    try {
      const billingPeriod: BillingCheckoutBody["billingPeriod"] = isAnnual
        ? "yearly"
        : "monthly"

      const { url } = await billingApi.createStudioProCheckout({
        billingPeriod,
      })

      window.location.assign(url)
    } finally {
      setCheckoutBusy(false)
    }
  }

  return {
    plans,
    isAnnual,
    setIsAnnual,
    checkoutBusy,
    upgradeStudioPro,
  }
}
