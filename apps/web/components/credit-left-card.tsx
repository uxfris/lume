"use client"

import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { useWorkspacePlan } from "@/hooks/use-workspace-plan"
import {
  creditsResetLabel,
  daysUntilUtcMonthEnd,
  meetingsCreditsSummary,
} from "@/lib/billing-display"

export function CreditLeftCard() {
  const { usage, isStudioPro, isLoading } = useWorkspacePlan()
  const { left, used, limit, progress } = meetingsCreditsSummary(usage)
  const daysUntilReset = daysUntilUtcMonthEnd()

  const rightLabel = isLoading
    ? "—"
    : isStudioPro
      ? "Unlimited"
      : left != null
        ? `${left} left`
        : "—"

  const tooltipText = isStudioPro
    ? "Unlimited meetings on Studio Pro"
    : `${used}/${limit} monthly meetings`

  return (
    <div className="flex flex-col gap-2 rounded-sm bg-secondary p-3">
      <Link href={routes.settings.billing}>
        <Button
          variant="ghost"
          className="h-5 w-full justify-between px-0 hover:bg-transparent hover:opacity-75"
        >
          <span className="text-xs font-semibold">Credits</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="text-xs font-semibold">{rightLabel}</span>
            <ChevronRight size={12} />
          </div>
        </Button>
      </Link>
      {!isStudioPro && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Progress
              value={isLoading ? 0 : progress}
              className="bg-muted brightness-90"
            />
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>{tooltipText}</span>
          </TooltipContent>
        </Tooltip>
      )}
      <div className="flex items-center gap-1.5">
        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">
          {isLoading
            ? "Loading usage…"
            : creditsResetLabel(usage, daysUntilReset)}
        </p>
      </div>
    </div>
  )
}
