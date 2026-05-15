import type { Meeting, MeetingCaptureSource } from "@workspace/types"

/** Meetings whose capture source is included (empty selection = no filter). */
export function filterMeetingsBySources(
  meetings: Meeting[],
  sources: MeetingCaptureSource[]
): Meeting[] {
  if (sources.length === 0) return meetings
  const allowed = new Set(sources)
  return meetings.filter((m) => allowed.has(m.source))
}
