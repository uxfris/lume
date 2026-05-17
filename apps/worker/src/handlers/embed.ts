import { randomUUID } from "node:crypto"
import type { Job } from "bullmq"
import { deliverUserNotification, Prisma, prisma } from "@workspace/database"
import type { MeetingStatus } from "@workspace/database"
import { QueueName, type EmbedJobPayload } from "@workspace/queue"
import { logger } from "../logger"
import { createProcessingEventAndPublish } from "../lib/processing-events"
import { embedText } from "../lib/openai"
import { chunkSegmentsForEmbedding } from "../lib/transcript-chunks"

export async function embedHandler(
  job: Job<EmbedJobPayload>
): Promise<{ meetingId: string }> {
  const { meetingId, workspaceId, userId, traceId } = job.data
  const log = logger.child({
    queue: QueueName.Embed,
    jobId: job.id,
    meetingId,
    workspaceId,
    userId,
    traceId,
  })

  log.info("embed job received")

  try {
    type MeetingEmbedRow = {
      id: string
      userId: string
      title: string
      status: MeetingStatus
      summary: Prisma.JsonValue | null
    }

    const meeting = (await prisma.meeting.findFirst({
      where: { id: meetingId, workspaceId },
      select: {
        id: true,
        userId: true,
        title: true,
        status: true,
        summary: true,
      },
    })) as MeetingEmbedRow | null

    if (!meeting || meeting.summary == null) {
      log.warn("meeting missing or no summary; skipping embed")
      return { meetingId }
    }

    if (meeting.status === "SUMMARIZED") {
      log.info("meeting already summarized; skipping embed")
      return { meetingId }
    }

    if (meeting.status !== "ANALYZING") {
      log.warn({ status: meeting.status }, "meeting not in ANALYZING state; skipping embed")
      return { meetingId }
    }

    await createProcessingEventAndPublish({
      meetingId,
      stage: "EMBED",
      status: "STARTED",
    })

    const segments = await prisma.transcriptSegment.findMany({
      where: { meetingId },
      orderBy: { index: "asc" },
      include: {
        participant: {
          select: { name: true, externalId: true },
        },
      },
    })

    const windows = chunkSegmentsForEmbedding(
      segments.map((s) => ({
        text: s.text,
        startMs: s.startMs,
        endMs: s.endMs,
        speaker:
          s.participant?.name ??
          (s.participant?.externalId ? `Speaker ${s.participant.externalId}` : null),
      }))
    )

    let totalEmbedCost = 0

    const embedded: Array<{
      content: string
      startMs: number
      endMs: number
      vecLiteral: string
    }> = []
    for (const w of windows) {
      const { embedding, costUsd } = await embedText(w.content)
      totalEmbedCost += costUsd
      embedded.push({ ...w, vecLiteral: `[${embedding.join(",")}]` })
    }

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM "meeting_chunk" WHERE "meetingId" = $1`,
        meetingId
      )

      for (const row of embedded) {
        const id = randomUUID()
        await tx.$executeRawUnsafe(
          `INSERT INTO "meeting_chunk" ("id", "meetingId", "content", "startMs", "endMs", "embedding", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6::vector, NOW(), NOW())`,
          id,
          meetingId,
          row.content,
          row.startMs,
          row.endMs,
          row.vecLiteral
        )
      }

      await tx.meeting.update({
        where: { id: meetingId },
        data: { status: "SUMMARIZED" },
      })
    })

    await createProcessingEventAndPublish({
      meetingId,
      stage: "EMBED",
      status: "SUCCEEDED",
      metadata: {
        cost_usd: totalEmbedCost,
        chunkCount: windows.length,
      },
    })

    await deliverUserNotification({
      userId: meeting.userId,
      type: "MEETING_SUMMARY",
      title: "Meeting summary ready",
      body: `AI notes for "${meeting.title}" are ready to view.`,
      href: `/meeting/${meetingId}`,
    }).catch((err) => {
      log.warn({ err }, "failed to deliver meeting summary notification")
    })

    log.info({ costUsd: totalEmbedCost, chunks: windows.length }, "embed job completed")
    return { meetingId }
  } catch (err) {
    log.error({ err }, "embed job failed")

    await prisma.meeting
      .update({ where: { id: meetingId }, data: { status: "FAILED" } })
      .catch(() => {})

    await createProcessingEventAndPublish({
      meetingId,
      stage: "EMBED",
      status: "FAILED",
      message: (err as Error).message,
      metadata: { error: (err as Error).message },
    }).catch(() => {})

    return { meetingId }
  }
}
