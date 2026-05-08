import type { Meeting } from "@workspace/database"

export interface MeetingRecallContext {
  meeting: Meeting
  payload: unknown
  traceId?: string
}
