import type { Meeting } from "@workspace/types"

/** User ids to compare against the toolbar filter (workspace member ids). */
function attendeeIdsTreatedAsHosts(meeting: Meeting): string[] {
  const hosts = meeting.attendees.filter((a) => a.isHost === true)
  if (hosts.length > 0) return hosts.map((a) => a.id)
  // Legacy rows before `isHost` was stored: treat every listed attendee as a possible host match.
  return meeting.attendees.map((a) => a.id)
}

/** Meetings where at least one host attendee id is in `hostIds`. */
export function filterMeetingsByHosts(
  meetings: Meeting[],
  hostIds: string[]
): Meeting[] {
  if (hostIds.length === 0) return meetings
  const allowed = new Set(hostIds)
  return meetings.filter((m) =>
    attendeeIdsTreatedAsHosts(m).some((id) => allowed.has(id))
  )
}
