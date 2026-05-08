import LogoIcon from "@/assets/icons/logo-icon"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Progress } from "@workspace/ui/components/progress"
import { Check } from "lucide-react"
import type { BillingUsageResponse } from "@workspace/types"
import { starterPlanLimits } from "@workspace/types"

const STARTER_STORAGE_MINUTES_APPROX = 13 * 60

function planHeadline(plan: BillingUsageResponse["plan"]) {
  if (plan === "studio-pro") {
    return {
      title: "You're on Studio Pro",
      subtitle: "Unlimited transcription this month",
    }
  }
  return {
    title: "You're on Starter",
    subtitle: "Free plan • Upgrade anytime",
  }
}

function meetingsProgressValue(usage: BillingUsageResponse) {
  const limit = usage.meetingsLimit
  if (limit == null || limit <= 0) return null
  return Math.min(100, Math.round((usage.meetingsUsed / limit) * 100))
}

function storageProgressValue(usage: BillingUsageResponse) {
  const cap =
    usage.plan === "studio-pro" ? 2000 * 60 : STARTER_STORAGE_MINUTES_APPROX
  if (cap <= 0) return 0
  return Math.min(100, Math.round((usage.minutesUsed / cap) * 100))
}

export function BillingCredits({
  usage,
}: {
  usage: BillingUsageResponse | null
}) {
  const headline =
    usage == null
      ? {
          title: "Plans & usage",
          subtitle: "Sign in or refresh to load usage.",
        }
      : planHeadline(usage.plan)

  const meetingsPct = usage ? meetingsProgressValue(usage) : null
  const storagePct = usage ? storageProgressValue(usage) : null

  const meetingsLine =
    usage?.meetingsLimit != null
      ? `You've used ${usage.meetingsUsed} of ${usage.meetingsLimit} included meetings this month`
      : usage
        ? "Unlimited meetings on your current plan"
        : `You've used 0 of ${starterPlanLimits.meetingsPerMonth} included meetings this month`

  const minutesLine =
    usage?.minutesLimit != null
      ? `${usage.minutesUsed} of ${usage.minutesLimit} included transcription minutes used (${usage.period} UTC)`
      : usage
        ? `${usage.minutesUsed} transcription minutes this month (${usage.period} UTC)`
        : "0 transcription minutes this month (UTC)"

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-3 rounded-lg bg-primary p-4">
        <div className="flex items-center gap-2">
          <LogoIcon className="h-14 w-14 text-primary-foreground" />
          <div>
            <h2 className="text-base font-semibold text-primary-foreground">
              {headline.title}
            </h2>
            <p className="text-sm text-primary-foreground/50">
              {headline.subtitle}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-primary-foreground" />
            <span className="text-sm text-primary-foreground">
              {usage?.plan === "studio-pro"
                ? "Unlimited meetings"
                : `${starterPlanLimits.meetingsPerMonth} meetings/month`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-primary-foreground" />
            <span className="text-sm text-primary-foreground">
              {usage?.plan === "studio-pro"
                ? "Large recording allowance"
                : "~13 hours of recording storage"}
            </span>
          </div>
        </div>
        <ManageBillingDialog usage={usage} />
      </div>
      <div className="flex flex-col gap-6 md:gap-3 lg:col-span-2">
        <div className="h-full space-y-4 rounded-lg bg-card p-4">
          <h3 className="pt-1 text-sm">
            {meetingsLine}
            {meetingsPct != null ? (
              <>
                {" "}
                <span className="text-muted-foreground">({meetingsPct}%)</span>
              </>
            ) : null}
          </h3>
          <Progress value={meetingsPct ?? (usage ? 0 : 20)} className="h-2" />
        </div>
        <div className="h-full space-y-4 rounded-lg bg-card p-4">
          <h3 className="pt-1 text-sm">{minutesLine}</h3>
          <Progress value={storagePct ?? (usage ? 0 : 15)} className="h-2" />
        </div>
      </div>
    </div>
  )
}

export function ManageBillingDialog({
  usage,
}: {
  usage: BillingUsageResponse | null
}) {
  const renews =
    usage?.subscriptionRenewsAt != null
      ? new Date(usage.subscriptionRenewsAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null

  const planName =
    usage?.plan === "studio-pro"
      ? "Studio Pro"
      : usage?.plan === "starter"
        ? "Starter"
        : "—"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="mt-3 w-full">
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Plan</DialogTitle>
          <DialogDescription>Subscription & billing settings</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
          <LogoIcon className="h-14 w-14" />
          <div>
            <h2 className="font-semibold">{planName}</h2>
            <p className="text-sm text-muted-foreground">
              {renews
                ? `Renews on ${renews}`
                : usage?.plan === "starter"
                  ? "No active subscription"
                  : "Renewal date unavailable"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" className="flex-1">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
