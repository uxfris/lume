"use client"

import LogoIcon from "@/assets/icons/logo-icon"
import { billingApi } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import type { BillingUsageResponse } from "@workspace/types"
import { useState } from "react"

export function ManageBillingDialog({
  usage,
}: {
  usage: BillingUsageResponse | null
}) {
  const [busyFlow, setBusyFlow] = useState<"customer-update" | null>(null)

  async function openPortal() {
    setBusyFlow("customer-update")
    try {
      const { url } = await billingApi.createBillingPortalSession()
      window.location.href = url
    } catch {
      setBusyFlow(null)
    } finally {
      setBusyFlow(null)
    }
  }

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
          <Button
            className="flex-1"
            disabled={busyFlow != null}
            onClick={() => {
              void openPortal()
            }}
          >
            {busyFlow === "customer-update"
              ? "Redirecting..."
              : "Edit billing information"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
