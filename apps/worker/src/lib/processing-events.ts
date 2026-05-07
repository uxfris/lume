import type { Prisma } from "@workspace/database"
import { prisma } from "@workspace/database"
import { getRedisConnection } from "@workspace/queue"

type ProcessingEventPayload = {
  meetingId: string
  stage: "TRANSCRIBE" | "DIARIZE" | "ANALYZE" | "EMBED"
  status: "STARTED" | "SUCCEEDED" | "FAILED"
  message?: string | null
  metadata?: Prisma.InputJsonValue
}

export async function createProcessingEventAndPublish(
  payload: ProcessingEventPayload
): Promise<void> {
  const event = await prisma.processingEvent.create({
    data: {
      meetingId: payload.meetingId,
      stage: payload.stage,
      status: payload.status,
      ...(payload.message ? { message: payload.message } : {}),
      ...(payload.metadata ? { metadata: payload.metadata } : {}),
    },
  })

  const meeting = await prisma.meeting.findUnique({
    where: { id: payload.meetingId },
    select: { status: true },
  })

  const channel = `meeting:${payload.meetingId}`
  await getRedisConnection().publish(
    channel,
    JSON.stringify({
      type: "processing.event",
      meetingId: payload.meetingId,
      stage: event.stage,
      status: event.status,
      message: event.message,
      metadata: event.metadata,
      createdAt: event.createdAt.toISOString(),
      meetingStatus: meeting?.status ?? null,
    })
  )
}
