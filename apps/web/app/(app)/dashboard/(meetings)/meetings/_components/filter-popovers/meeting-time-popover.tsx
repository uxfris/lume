"use client"

import { CalendarMark } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Separator } from "@workspace/ui/components/separator"
import { ChevronDown, X } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@workspace/ui/components/calendar"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  useMeetingListTimeFilter,
  type MeetingTimePreset,
} from "../../_stores/meeting-list-time-filter-store"

const PRESET_LABELS: Record<MeetingTimePreset, string> = {
  "any-time": "Any time",
  today: "Today",
  "last-7-days": "Last 7 days",
  "last-14-days": "Last 14 days",
  "last-30-days": "Last 30 days",
}

function timeFilterTriggerLabel(
  preset: MeetingTimePreset,
  customRange: DateRange | undefined
): string {
  const complete =
    customRange?.from &&
    customRange?.to &&
    customRange.to >= customRange.from

  if (complete) {
    return `${format(customRange.from!, "MMM d")} – ${format(customRange.to!, "MMM d")}`
  }
  return PRESET_LABELS[preset]
}

function isTimeFilterActive(
  preset: MeetingTimePreset,
  customRange: DateRange | undefined
): boolean {
  const complete =
    customRange?.from &&
    customRange?.to &&
    customRange.to >= customRange.from
  return preset !== "any-time" || Boolean(complete)
}

export function MeetingTimePopover() {
  const preset = useMeetingListTimeFilter((s) => s.preset)
  const customRange = useMeetingListTimeFilter((s) => s.customRange)
  const setPreset = useMeetingListTimeFilter((s) => s.setPreset)
  const setCustomRange = useMeetingListTimeFilter((s) => s.setCustomRange)
  const clearTimeFilter = useMeetingListTimeFilter((s) => s.clearTimeFilter)

  const triggerLabel = timeFilterTriggerLabel(preset, customRange)
  const radioValue =
    customRange?.from && customRange?.to ? undefined : preset

  const customComplete =
    Boolean(customRange?.from && customRange?.to) &&
    customRange!.to! >= customRange!.from!

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={
            isTimeFilterActive(preset, customRange) ? "secondary" : "outline"
          }
          size="xs"
          className="flex-1 justify-between gap-1 text-muted-foreground"
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className={cn(
          "px-1",
          customComplete ? "w-56" : "w-48"
        )}
      >
        <PopoverHeader>
          <PopoverTitle className="px-3">Date Range</PopoverTitle>
        </PopoverHeader>
        <Separator />
        <RadioGroup
          value={radioValue}
          onValueChange={(v) => setPreset(v as MeetingTimePreset)}
        >
          <FieldLabel htmlFor="any-time" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  Any time
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="any-time"
                id="any-time"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="today" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  Today
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="today"
                id="today"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="last-7-days" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  Last 7 days
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="last-7-days"
                id="last-7-days"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="last-14-days" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  Last 14 days
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="last-14-days"
                id="last-14-days"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="last-30-days" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  Last 30 days
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="last-30-days"
                id="last-30-days"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
        </RadioGroup>
        <Separator />
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-secondary"
            >
              <div className="text-sm font-medium normal-case text-popover-foreground">
                {customComplete ? (
                  <div className="flex items-center gap-1">
                    <span>
                      {format(customRange!.from!, "MMM d")} to{" "}
                      {format(customRange!.to!, "MMM d")}
                    </span>
                  </div>
                ) : (
                  <span>Custom date range</span>
                )}
              </div>
              <CalendarMark className="size-4 shrink-0 opacity-70" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Card className="mx-auto w-fit p-0">
              <CardContent className="p-0">
                <Calendar
                  mode="range"
                  defaultMonth={customRange?.from}
                  selected={customRange}
                  onSelect={(range) => {
                    if (!range) {
                      clearTimeFilter()
                      return
                    }
                    setCustomRange(range)
                  }}
                  captionLayout="dropdown"
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </CardContent>
            </Card>
            {customComplete ? (
              <div className="flex justify-end border-t p-2">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="gap-1"
                  onClick={() => clearTimeFilter()}
                >
                  <X className="size-3.5" />
                  Clear range
                </Button>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>
      </PopoverContent>
    </Popover>
  )
}
