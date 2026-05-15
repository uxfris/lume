"use client"

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
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Separator } from "@workspace/ui/components/separator"
import { ChevronDown } from "lucide-react"

import { useMeetingListDurationFilter } from "../../_stores/meeting-list-duration-filter-store"
import type { MeetingDurationPreset } from "../../_stores/meeting-list-duration-filter-store"

const PRESET_LABELS: Record<MeetingDurationPreset, string> = {
  "any-duration": "Any duration",
  "less-15-min": "<15 mins",
  "15-to-30mins": "15 to 30 mins",
  "30-to-60mins": "30 to 60 mins",
  "60-to-90mins": "60 to 90 mins",
  "more-than-90mins": "90+ mins",
}

export function MeetingDurationPopover() {
  const preset = useMeetingListDurationFilter((s) => s.preset)
  const setDurationPreset = useMeetingListDurationFilter(
    (s) => s.setDurationPreset
  )

  const triggerLabel = PRESET_LABELS[preset]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={preset !== "any-duration" ? "secondary" : "outline"}
          size="xs"
          className="flex-1 justify-between gap-1 text-muted-foreground"
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-48 px-1">
        <PopoverHeader>
          <PopoverTitle className="px-3">Duration</PopoverTitle>
        </PopoverHeader>
        <Separator />
        <RadioGroup
          value={preset}
          onValueChange={(v) =>
            setDurationPreset(v as MeetingDurationPreset)
          }
        >
          <FieldLabel htmlFor="any-duration" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  Any duration
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="any-duration"
                id="any-duration"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="less-15-min" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  {"<15 mins"}
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="less-15-min"
                id="less-15-min"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="15-to-30mins" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  15 to 30 mins
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="15-to-30mins"
                id="15-to-30mins"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="30-to-60mins" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  30 to 60 mins
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="30-to-60mins"
                id="30-to-60mins"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="60-to-90mins" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  60 to 90 mins
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="60-to-90mins"
                id="60-to-90mins"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="more-than-90mins" className="border-none">
            <Field
              orientation="horizontal"
              className="group rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FieldContent>
                <FieldTitle className="text-sm font-medium normal-case text-popover-foreground">
                  90+ mins
                </FieldTitle>
              </FieldContent>
              <RadioGroupItem
                value="more-than-90mins"
                id="more-than-90mins"
                className="group-hover:data-[state=unchecked]:border-foreground"
              />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  )
}
