import { format, isToday, isYesterday } from "date-fns"

export function meetingTimeLabel(isoDate: string): string {
  const date = new Date(isoDate)

  if (isToday(date)) return "today's"
  if (isYesterday(date)) return "yesterday's"

  return `the ${format(date, "MMM d")}`
}
