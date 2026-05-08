import { SettingHeader } from "../_components/setting-header"
import { BillingCredits } from "./_components/billing-credits"
import { BillingPlan } from "./_components/billing-plan"
import { billingApi } from "@workspace/api-client"
import { getServerApiFetchOptions } from "@/lib/server-api"
import type { BillingUsageResponse } from "@workspace/types"

export default async function Billing() {
  const fetchOpts = await getServerApiFetchOptions()
  let usage: BillingUsageResponse | null = null
  try {
    usage = await billingApi.getBilling(fetchOpts)
  } catch {
    usage = null
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-20 md:p-12 lg:gap-8">
      <SettingHeader
        title="Plans & credits"
        description="Manage your subscription plan and transcription usage."
      />
      <BillingCredits usage={usage} />
      <BillingPlan usage={usage} />
    </div>
  )
}
