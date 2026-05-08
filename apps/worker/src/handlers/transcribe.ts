import type { Job } from "bullmq"
import { prisma, recordTranscriptionBillingUsage } from "@workspace/database"
import {
  QueueName,
  getQueue,
  type TranscribeJobPayload,
} from "@workspace/queue"
import { logger } from "../logger"
import {
  createPresignedAudioDownload,
  saveRawTranscriptJson,
} from "../lib/s3-presign"
import { transcribeAudio } from "../lib/whisper"
import { createProcessingEventAndPublish } from "../lib/processing-events"

export async function transcribeHandler(
  job: Job<TranscribeJobPayload>
): Promise<{ meetingId: string }> {
  const { meetingId, workspaceId, userId, audioKey, traceId } = job.data
  const log = logger.child({
    queue: QueueName.Transcribe,
    jobId: job.id,
    meetingId,
    workspaceId,
    userId,
    audioKey,
    traceId,
  })

  log.info("transcribe job received")

  try {
    const startResult = await prisma.meeting.updateMany({
      where: { id: meetingId, status: "UPLOADED" },
      data: { status: "TRANSCRIBING" },
    })

    if (startResult.count === 0) {
      log.warn("meeting not in UPLOADED state; skipping")
      return { meetingId }
    }

    await createProcessingEventAndPublish({
      meetingId,
      stage: "TRANSCRIBE",
      status: "STARTED",
    })

    const startedAt = Date.now()
    const audioUrl = await createPresignedAudioDownload(audioKey)
    const whisper = await transcribeAudio(audioUrl)
    const durationMs = Date.now() - startedAt

    const transcriptBackupKey = await saveRawTranscriptJson({
      meetingId,
      payload: whisper,
    })

    // Keep writes idempotent for retried runs that got past CAS in edge cases.
    await prisma.transcriptSegment.deleteMany({ where: { meetingId } })
    if (whisper.segments.length > 0) {
      await prisma.transcriptSegment.createMany({
        data: whisper.segments.map((segment, index) => ({
          meetingId,
          index,
          startMs: Math.max(0, Math.round(segment.startMs)),
          endMs: Math.max(0, Math.round(segment.endMs)),
          text: segment.text?.trim() ?? "",
        })),
      })
    }

    const durationSeconds =
      whisper.durationSeconds != null
        ? Math.max(0, Math.round(whisper.durationSeconds))
        : null

    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: "TRANSCRIBED",
        durationSeconds,
        language: whisper.language ?? null,
      },
    })

    await recordTranscriptionBillingUsage({
      workspaceId,
      meetingId,
      durationSeconds,
    })

    await createProcessingEventAndPublish({
      meetingId,
      stage: "TRANSCRIBE",
      status: "SUCCEEDED",
      message: `done in ${Math.round(durationMs / 1000)}s`,
      metadata: {
        durationMs,
        transcriptBackupKey,
        segmentCount: whisper.segments.length,
      },
    })

    await getQueue(QueueName.Diarize).add(
      "diarize",
      { meetingId, workspaceId, userId, audioKey, traceId },
      { jobId: `diarize-${meetingId}` }
    )

    log.info({ durationMs }, "transcribe job completed")
    return { meetingId }
  } catch (err) {
    log.error({ err }, "transcribe job failed")

    await prisma.meeting
      .update({ where: { id: meetingId }, data: { status: "FAILED" } })
      .catch(() => {})

    await createProcessingEventAndPublish({
      meetingId,
      stage: "TRANSCRIBE",
      status: "FAILED",
      message: (err as Error).message,
      metadata: { error: (err as Error).message },
    })
      .catch(() => {})

    // Swallow errors to avoid automatic expensive retry loops.
    return { meetingId }
  }
}
