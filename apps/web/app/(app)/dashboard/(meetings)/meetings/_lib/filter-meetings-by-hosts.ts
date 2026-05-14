import type { Meeting } from "@workspace/types"

/** Meetings whose owner appears in `attendees` with an id in `hostIds` (list API uses the owner as attendees). */
export function filterMeetingsByHosts(
  meetings: Meeting[],
  hostIds: string[]
): Meeting[] {
  if (hostIds.length === 0) return meetings
  const allowed = new Set(hostIds)
  return meetings.filter((m) =>
    m.attendees.some((a) => allowed.has(a.id))
  )
}
