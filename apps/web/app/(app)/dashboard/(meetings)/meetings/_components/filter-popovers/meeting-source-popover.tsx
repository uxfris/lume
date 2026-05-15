"use client"

import type { MeetingCaptureSource } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown } from "lucide-react"

import { useMeetingListSourceFilter } from "../../_stores/meeting-list-source-filter-store"

const SOURCE_OPTIONS: { id: MeetingCaptureSource; label: string }[] = [
  { id: "bot", label: "Meeting Note-taker" },
  { id: "upload", label: "Uploads" },
]

function sourceFilterLabel(selected: MeetingCaptureSource[]): string {
  if (selected.length === 0) return "Any source"
  if (selected.length === 1) {
    return SOURCE_OPTIONS.find((s) => s.id === selected[0])?.label ?? "1 source"
  }
  return `${selected.length} sources`
}

export function MeetingSourcePopover({
  isCreatedByMe,
}: {
  isCreatedByMe: boolean | undefined
}) {
  const selectedSources = useMeetingListSourceFilter((s) => s.selectedSources)
  const toggleSource = useMeetingListSourceFilter((s) => s.toggleSource)

  const triggerLabel = sourceFilterLabel(selectedSources)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={selectedSources.length > 0 ? "secondary" : "outline"}
          size="xs"
          className={cn(
            "justify-between gap-1 text-muted-foreground",
            !isCreatedByMe && "col-span-2 md:col-span-1"
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-48 px-1">
        <PopoverHeader>
          <PopoverTitle className="px-3">Captured from</PopoverTitle>
        </PopoverHeader>
        <Separator />
        <div>
          {SOURCE_OPTIONS.map((source) => {
            const checked = selectedSources.includes(source.id)
            return (
              <div
                key={source.id}
                role="button"
                tabIndex={0}
                className="flex w-full cursor-pointer items-center rounded-md p-3 outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => toggleSource(source.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleSource(source.id)
                  }
                }}
              >
                <p className="flex-1 text-sm font-medium text-popover-foreground normal-case">
                  {source.label}
                </p>
                <div
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleSource(source.id)}
                    aria-label={`Filter by ${source.label}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
