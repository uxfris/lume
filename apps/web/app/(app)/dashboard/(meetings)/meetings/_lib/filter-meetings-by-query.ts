import type { Meeting } from "@workspace/types"

function normalizeKeywords(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((k) => k.trim())
    .filter(Boolean)
}

function meetingSearchBlob(meeting: Meeting): string {
  const attendeeBits = meeting.attendees.map((a) => a.initials).join(" ")
  return [
    meeting.title,
    meeting.summary,
    meeting.timestamp,
    meeting.duration,
    attendeeBits,
  ]
    .join(" ")
    .toLowerCase()
}

/** Every whitespace-separated keyword must appear somewhere in the meeting fields (case-insensitive). */
export function filterMeetingsByQuery(
  meetings: Meeting[],
  query: string
): Meeting[] {
  const keywords = normalizeKeywords(query)
  if (keywords.length === 0) return meetings

  return meetings.filter((m) => {
    const blob = meetingSearchBlob(m)
    return keywords.every((kw) => blob.includes(kw))
  })
}
