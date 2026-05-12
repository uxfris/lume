export type RecallEventResult =
  | {
      ok: true
      meetingId?: string
      action: "TRANSCRIPT_IMPORTED" | "FAILED" | "NOTED" | "CALENDAR_SYNCED"
    }
  | { ok: false; reason: "MEETING_NOT_FOUND" | "ALREADY_PROCESSED" | "IGNORED" }

export interface RecallStatusEnvelope {
  event?: string
  data?: {
    data?: {
      code?: string
      sub_code?: string | null
      updated_at?: string
    }
    bot?: { id?: string; metadata?: Record<string, string> }
    transcript?: { id?: string; metadata?: Record<string, string> }
    recording?: { id?: string; metadata?: Record<string, string> }
    calendar?: { id?: string }
    calendar_id?: string
    last_updated_ts?: string
  }
}

/**
 * Subset of [Google Calendar API v3 Event](https://developers.google.com/workspace/calendar/api/v3/reference/events#resource)
 * as returned in Recall calendar event payloads.
 */
export interface GoogleCalendarEventRaw {
  htmlLink?: string
  summary?: string
  creator?: { email?: string }
  organizer?: { email?: string }
}

/**
 * Subset of [Microsoft Graph event](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0#properties)
 * as returned in Recall calendar event payloads.
 */
export interface MicrosoftGraphEventRaw {
  webLink?: string
  subject?: string
  organizer?: { emailAddress?: { address?: string } }
}

export interface RecallCalendarEventRecord {
  id: string
  start_time: string
  end_time: string
  calendar_id?: string | null
  meeting_url?: string | null
  meeting_platform?: string | null
  platform?: string | null
  is_deleted: boolean
  /**
   * Raw calendar event JSON from the provider (Recall forwards it).
   * Shape matches {@link GoogleCalendarEventRaw} or {@link MicrosoftGraphEventRaw} depending on platform.
   */
  raw?: unknown
  ical_uid?: string
  calendar?: { oauth_email?: string | null; platform_email?: string | null }
  bots?: Array<{ bot_id?: string }>
}
