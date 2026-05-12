import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { ChevronRight } from "lucide-react"
import React from "react"
import Link from "next/link"
import { routes } from "@/lib/routes"

export function CreditLeftCard() {
  return (
    <div className="flex flex-col gap-2 rounded-sm bg-secondary p-3">
      <Link href={routes.settings.billing}>
        <Button
          variant="ghost"
          className="h-5 w-full justify-between px-0 hover:bg-transparent hover:opacity-75"
        >
          <span className="text-xs font-semibold">Credits</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="text-xs font-semibold">3 Left</span>
            <span>
              <ChevronRight size={12} />
            </span>
          </div>
        </Button>
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          <Progress value={60} className="bg-muted brightness-90" />
        </TooltipTrigger>
        <TooltipContent side="top">
          <span>3/5 monthly credits</span>
        </TooltipContent>
      </Tooltip>
      <div className="flex items-center gap-1.5">
        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">
          Monthly credits reset within 10 days
        </p>
      </div>
    </div>
  )
}
