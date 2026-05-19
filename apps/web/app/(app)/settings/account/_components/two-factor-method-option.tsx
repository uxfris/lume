"use client"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

type Props = {
  icon: ReactNode
  title: string
  description: string
  badge?: string
  highlighted?: boolean
  unavailable?: boolean
  onClick?: () => void
}

export function TwoFactorMethodOption({
  icon,
  title,
  description,
  badge,
  highlighted,
  unavailable,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-md border p-4 text-left transition-colors",
        highlighted
          ? "border-ring bg-secondary/30"
          : "border-border hover:border-ring hover:bg-secondary/50",
        "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        unavailable &&
          "cursor-not-allowed opacity-50 hover:border-border hover:bg-transparent"
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary">
        {icon}
      </div>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          {badge ? (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
