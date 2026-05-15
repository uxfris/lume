import type { Meeting } from "@workspace/types"

import type { MeetingDurationPreset } from "../_stores/meeting-list-duration-filter-store"

/** Fallback when `durationSeconds` is null (parse UI `duration` label). */
function durationSecondsFromLabel(duration: string): number | null {
  const t = duration.trim()
  if (!t || t === "—") return null

  const sec = /^(\d+)s$/i.exec(t)
  if (sec) return Number(sec[1])

  const min = /^(\d+)m$/i.exec(t)
  if (min) return Number(min[1]) * 60

  const hm = /^(\d+)h (\d+)m$/i.exec(t)
  if (hm) return Number(hm[1]) * 3600 + Number(hm[2]) * 60

  return null
}

function meetingDurationSeconds(meeting: Meeting): number | null {
  if (meeting.durationSeconds != null) return meeting.durationSeconds
  return durationSecondsFromLabel(meeting.duration)
}

function matchesPreset(
  seconds: number,
  preset: MeetingDurationPreset
): boolean {
  switch (preset) {
    case "any-duration":
      return true
    case "less-15-min":
      return seconds < 15 * 60
    case "15-to-30mins":
      return seconds >= 15 * 60 && seconds < 30 * 60
    case "30-to-60mins":
      return seconds >= 30 * 60 && seconds < 60 * 60
    case "60-to-90mins":
      return seconds >= 60 * 60 && seconds < 90 * 60
    case "more-than-90mins":
      return seconds >= 90 * 60
    default:
      return true
  }
}

export function filterMeetingsByDuration(
  meetings: Meeting[],
  preset: MeetingDurationPreset
): Meeting[] {
  if (preset === "any-duration") return meetings

  return meetings.filter((m) => {
    const sec = meetingDurationSeconds(m)
    if (sec == null) return false
    return matchesPreset(sec, preset)
  })
}
