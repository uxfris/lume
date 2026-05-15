import { Meeting } from "@workspace/types"

export function filterMeetingsByParticipants(
  meetings: Meeting[],
  participantIds: string[]
): Meeting[] {
  if (participantIds.length === 0) return meetings
  const allowed = new Set(participantIds)
  return meetings.filter((m) => m.attendees.some(({ id }) => allowed.has(id)))
}
