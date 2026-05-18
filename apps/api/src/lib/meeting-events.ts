import { getRedisConnection } from "@workspace/queue"

type MeetingEventPayload = {
  meetingId: string
  meetingStatus?: string | null
  stage?: string
  status?: string
  message?: string | null
}

/** Publish a meeting processing/status event to Redis for SSE subscribers. */
export async function publishMeetingEvent(
  payload: MeetingEventPayload
): Promise<void> {
  const channel = `meeting:${payload.meetingId}`
  await getRedisConnection().publish(
    channel,
    JSON.stringify({
      type: "processing.event",
      ...payload,
    })
  )
}
