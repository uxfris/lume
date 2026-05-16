"use client"

import type { Meeting } from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"

type EditorTitleProps = {
  meeting: Meeting
  className?: string
}

export function EditorTitle({ meeting, className }: EditorTitleProps) {
  return (
    <h1
      className={cn(
        "text-4xl font-bold tracking-tight text-foreground md:text-5xl-custom",
        className
      )}
    >
      {meeting.title}
    </h1>
  )
}
