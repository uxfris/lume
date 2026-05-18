import type { Job } from "bullmq"
import { Prisma, prisma } from "@workspace/database"
import {
  QueueName,
  getQueue,
  type AnalyzeJobPayload,
} from "@workspace/queue"
import { logger } from "../logger"
import { createProcessingEventAndPublish } from "../lib/processing-events"
import { buildMeetingSummaryV2 } from "@workspace/types"
import { analyzeMeetingTranscript } from "../lib/openai"

export async function analyzeHandler(
  job: Job<AnalyzeJobPayload>
): Promise<{ meetingId: string }> {
  const { meetingId, workspaceId, userId, traceId } = job.data
  const log = logger.child({
    queue: QueueName.Analyze,
    jobId: job.id,
    meetingId,
    workspaceId,
    userId,
    traceId,
  })

  log.info("analyze job received")

  try {
    const startResult = await prisma.meeting.updateMany({
      where: { id: meetingId, workspaceId, status: "TRANSCRIBED" },
      data: { status: "ANALYZING" },
    })

    if (startResult.count === 0) {
      log.warn("meeting not in TRANSCRIBED state; skipping")
      return { meetingId }
    }

    await createProcessingEventAndPublish({
      meetingId,
      stage: "ANALYZE",
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

    const transcript = segments
      .map((s) => {
        const sp =
          s.participant?.name?.trim() ||
          (s.participant?.externalId
            ? `Speaker ${s.participant.externalId}`
            : "Speaker")
        return `${sp}: ${s.text}`
      })
      .join("\n")

    const { analysis, costUsd } = await analyzeMeetingTranscript(transcript)

    const stored = buildMeetingSummaryV2({
      ...analysis,
      actionItems: analysis.actionItems.map((a) => ({
        title: a.title.trim(),
        assigneeHint:
          a.assigneeHint && a.assigneeHint.trim().length > 0
            ? a.assigneeHint.trim()
            : null,
      })),
    })

    const summaryJson: Prisma.InputJsonValue = {
      version: stored.version,
      doc: stored.doc as Prisma.InputJsonValue,
      sentiment: stored.sentiment,
      actionItems: stored.actionItems,
    }

    await prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { meetingId } })

      await tx.meeting.update({
        where: { id: meetingId },
        data: { summary: summaryJson },
      })

      if (analysis.actionItems.length > 0) {
        await tx.task.createMany({
          data: analysis.actionItems.map((a) => ({
            workspaceId,
            meetingId,
            title: a.title.trim(),
            assigneeId: null,
            isCompleted: false,
          })),
        })
      }
    })

    await createProcessingEventAndPublish({
      meetingId,
      stage: "ANALYZE",
      status: "SUCCEEDED",
      metadata: { cost_usd: costUsd },
    })

    await getQueue(QueueName.Embed).add(
      "embed",
      { meetingId, workspaceId, userId, traceId },
      { jobId: `embed-${meetingId}` }
    )

    log.info({ costUsd }, "analyze job completed")
    return { meetingId }
  } catch (err) {
    log.error({ err }, "analyze job failed")

    await prisma.meeting
      .update({ where: { id: meetingId }, data: { status: "FAILED" } })
      .catch(() => {})

    await createProcessingEventAndPublish({
      meetingId,
      stage: "ANALYZE",
      status: "FAILED",
      message: (err as Error).message,
      metadata: { error: (err as Error).message },
    }).catch(() => {})

    return { meetingId }
  }
}
