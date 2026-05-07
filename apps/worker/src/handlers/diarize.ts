import type { Job } from "bullmq"
import { prisma } from "@workspace/database"
import { QueueName, getQueue, type DiarizeJobPayload } from "@workspace/queue"
import { logger } from "../logger"
import { createPresignedAudioDownload } from "../lib/s3-presign"
import { diarizeAudio, type DiarizeWindow } from "../lib/pyannote"

function inferSpeakerFromWindows(
  segmentMidpointMs: number,
  windows: DiarizeWindow[]
): string | null {
  const matching = windows.find(
    (window) =>
      segmentMidpointMs >= window.startMs && segmentMidpointMs <= window.endMs
  )
  return matching?.speaker ?? null
}

export async function diarizeHandler(
  job: Job<DiarizeJobPayload>
): Promise<{ meetingId: string }> {
  const { meetingId, workspaceId, userId, audioKey, traceId } = job.data
  const log = logger.child({
    queue: QueueName.Diarize,
    jobId: job.id,
    meetingId,
    workspaceId,
    userId,
    traceId,
  })

  log.info("diarize job received")

  try {
    await prisma.processingEvent.create({
      data: {
        meetingId,
        stage: "DIARIZE",
        status: "STARTED",
      },
    })

    const audioUrl = await createPresignedAudioDownload(audioKey)
    const windows = await diarizeAudio(audioUrl)
    const segments = await prisma.transcriptSegment.findMany({
      where: { meetingId },
      orderBy: { index: "asc" },
    })
    const existingParticipants = await prisma.meetingParticipant.findMany({
      where: { meetingId },
      select: { id: true, name: true },
    })
    const existingNames = new Set(
      existingParticipants
        .map((p) => p.name?.trim())
        .filter((name): name is string => Boolean(name))
    )
    const inferredSpeakerNames = Array.from(
      new Set(windows.map((w) => w.speaker?.trim()).filter(Boolean))
    ) as string[]
    const toCreate = inferredSpeakerNames.filter((name) => !existingNames.has(name))
    if (toCreate.length > 0) {
      await prisma.meetingParticipant.createMany({
        data: toCreate.map((name) => ({
          meetingId,
          name,
        })),
      })
    }
    const participants = await prisma.meetingParticipant.findMany({
      where: { meetingId },
      select: { id: true, name: true },
    })
    const participantByName = new Map(
      participants
        .filter((p) => p.name)
        .map((p) => [p.name as string, p.id])
    )

    const updates = segments.map((segment) => {
      const midpoint = Math.round((segment.startMs + segment.endMs) / 2)
      const inferred = inferSpeakerFromWindows(midpoint, windows)
      const participantId = inferred ? (participantByName.get(inferred) ?? null) : null

      return prisma.transcriptSegment.update({
        where: { id: segment.id },
        data: {
          participantId,
        },
      })
    })

    // Execute all updates in a single transaction
    await prisma.$transaction(updates)

    await prisma.processingEvent.create({
      data: {
        meetingId,
        stage: "DIARIZE",
        status: "SUCCEEDED",
        metadata: {
          diarizationWindowCount: windows.length,
          transcriptSegmentCount: segments.length,
        },
      },
    })

    await getQueue(QueueName.Analyze).add(
      "analyze",
      { meetingId, workspaceId, userId, traceId },
      { jobId: `analyze-${meetingId}` }
    )

    log.info("diarize job completed")
    return { meetingId }
  } catch (err) {
    await prisma.meeting
      .update({ where: { id: meetingId }, data: { status: "FAILED" } })
      .catch(() => {})

    log.error({ err }, "diarize job failed")

    await prisma.processingEvent
      .create({
        data: {
          meetingId,
          stage: "DIARIZE",
          status: "FAILED",
          message: (err as Error).message,
          metadata: { error: (err as Error).message },
        },
      })
      .catch(() => {})

    // Avoid automatic retries for heavy diarization requests.
    return { meetingId }
  }
}
