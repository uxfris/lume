import type { Meeting } from "@workspace/types"
import {
  endOfDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns"
import type { DateRange } from "react-day-picker"

import type { MeetingTimePreset } from "../_stores/meeting-list-time-filter-store"

function parseMeetingCreatedAt(meeting: Meeting): Date | null {
  try {
    const d = parseISO(meeting.createdAt)
    return Number.isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

function intervalForPreset(preset: MeetingTimePreset): {
  start: Date
  end: Date
} | null {
  const now = new Date()

  switch (preset) {
    case "any-time":
      return null
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) }
    case "last-7-days":
      return {
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now),
      }
    case "last-14-days":
      return {
        start: startOfDay(subDays(now, 13)),
        end: endOfDay(now),
      }
    case "last-30-days":
      return {
        start: startOfDay(subDays(now, 29)),
        end: endOfDay(now),
      }
    default:
      return null
  }
}

function intervalForCustomRange(
  range: Required<Pick<DateRange, "from" | "to">>
): { start: Date; end: Date } {
  let start = startOfDay(range.from!)
  let end = endOfDay(range.to!)
  if (start > end) {
    start = startOfDay(range.to!)
    end = endOfDay(range.from!)
  }
  return { start, end }
}

/** Preset buckets plus optional custom range; a complete custom range wins over the preset. */
export function filterMeetingsByTime(
  meetings: Meeting[],
  preset: MeetingTimePreset,
  customRange: DateRange | undefined
): Meeting[] {
  const customComplete =
    customRange?.from &&
    customRange?.to &&
    customRange.to >= customRange.from

  const interval = customComplete
    ? intervalForCustomRange({
        from: customRange!.from!,
        to: customRange!.to!,
      })
    : intervalForPreset(preset)

  if (!interval) return meetings

  return meetings.filter((m) => {
    const created = parseMeetingCreatedAt(m)
    if (!created) return false
    return isWithinInterval(created, interval)
  })
}
