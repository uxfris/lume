import type { Job } from "bullmq"
import {
  Prisma,
  prisma,
  recordTranscriptionBillingUsage,
} from "@workspace/database"
import {
  QueueName,
  getQueue,
  type ImportBotTranscriptJobPayload,
} from "@workspace/queue"
import { logger } from "../logger"
import { createProcessingEventAndPublish } from "../lib/processing-events"
import { saveRawTranscriptJson } from "../lib/s3-presign"
import {
  downloadMixedAudioBuffer,
  downloadTranscriptJson,
  getBotTranscriptDownloadUrl,
  getMixedAudioDownloadUrlForBot,
  getTranscriptDownloadUrlById,
  WorkerRecallError,
} from "../lib/recall"
import {
  flattenRecallTranscript,
  type FlatSegment,
} from "../lib/recall-transcript-flatten"
import {
  buildMeetingAudioKey,
  uploadMeetingAudio,
} from "../lib/s3-presign"

function maxEndMs(segments: FlatSegment[]): number {
  let max = 0
  for (const segment of segments) {
    if (segment.endMs > max) max = segment.endMs
  }
  return max
}

async function importMixedAudioIfNeeded(
  input: {
    meetingId: string
    externalBotId: string
    hasAudioKey: boolean
  },
  log: { info: (obj: object, msg: string) => void; warn: (obj?: object | string, msg?: string) => void }
): Promise<string | null> {
  if (input.hasAudioKey) return buildMeetingAudioKey(input.meetingId)

  try {
    const downloadUrl = await getMixedAudioDownloadUrlForBot(input.externalBotId)
    const buffer = await downloadMixedAudioBuffer(downloadUrl)
    const audioKey = await uploadMeetingAudio({
      meetingId: input.meetingId,
      body: buffer,
      contentType: "audio/mpeg",
    })
    log.info({ audioKey }, "imported Recall mixed audio")
    return audioKey
  } catch (err) {
    if (err instanceof WorkerRecallError && err.status === 404) {
      log.warn("Recall mixed audio not ready; skipping audio import")
      return null
    }
    log.warn({ err }, "failed to import Recall mixed audio; continuing")
    return null
  }
}

export async function importBotTranscriptHandler(
  job: Job<ImportBotTranscriptJobPayload>
): Promise<{ meetingId: string }> {
  const {
    meetingId,
    workspaceId,
    userId,
    externalBotId,
    transcriptId,
    traceId,
  } = job.data
  const log = logger.child({
    queue: QueueName.ImportBotTranscript,
    jobId: job.id,
    meetingId,
    workspaceId,
    userId,
    externalBotId,
    transcriptId,
    traceId,
  })

  log.info("import-bot-transcript job received")

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    })
    if (!meeting) {
      log.warn("meeting not found; skipping")
      return { meetingId }
    }
    // Idempotent: only run if the bot is still in SCHEDULED state. Re-runs
    // (e.g. webhook replay) are dropped silently.
    if (!["SCHEDULED", "LIVE", "TRANSCRIBING"].includes(meeting.status)) {
      log.warn(
        { status: meeting.status },
        "meeting not in SCHEDULED LIVE, or TRANSCRIBING state; skipping"
      )
      return { meetingId }
    }

    await createProcessingEventAndPublish({
      meetingId,
      stage: "TRANSCRIBE",
      status: "STARTED",
      message: "importing diarized transcript from Recall",
    })

    const startedAt = Date.now()
    const downloadUrl = transcriptId
      ? await getTranscriptDownloadUrlById(transcriptId)
      : (await getBotTranscriptDownloadUrl(externalBotId)).downloadUrl
    const transcriptJson = await downloadTranscriptJson(downloadUrl)
    const segments = flattenRecallTranscript(transcriptJson)
    const audioKey = await importMixedAudioIfNeeded(
      {
        meetingId,
        externalBotId,
        hasAudioKey: meeting.audioKey != null,
      },
      log
    )
    const durationMs = Date.now() - startedAt

    const transcriptBackupKey = await saveRawTranscriptJson({
      meetingId,
      payload: { source: "recall", transcript: transcriptJson },
    })

    const inferredLanguage =
      transcriptJson.find((b) => b.language_code)?.language_code ?? null

    await prisma.$transaction(async (tx) => {
      await tx.transcriptWord.deleteMany({ where: { segment: { meetingId } } })
      await tx.transcriptSegment.deleteMany({ where: { meetingId } })
      await tx.meetingParticipant.deleteMany({ where: { meetingId } })

      const dedupedParticipants = new Map<
        string,
        {
          externalId: string | null
          name: string | null
          email: string | null
          isHost: boolean | null
          platform: string | null
          extraData: unknown
        }
      >()
      for (const segment of segments) {
        const key =
          segment.participantExternalId ??
          `name:${segment.participantName ?? "unknown"}`
        if (dedupedParticipants.has(key)) continue
        dedupedParticipants.set(key, {
          externalId: segment.participantExternalId,
          name: segment.participantName,
          email: segment.participantEmail,
          isHost: segment.participantIsHost,
          platform: segment.participantPlatform,
          extraData: segment.participantExtraData,
        })
      }

      if (dedupedParticipants.size > 0) {
        await tx.meetingParticipant.createMany({
          data: Array.from(dedupedParticipants.values()).map((p) => ({
            meetingId,
            externalId: p.externalId,
            name: p.name,
            email: p.email,
            isHost: p.isHost,
            platform: p.platform,
            extraData: (p.extraData ??
              Prisma.JsonNull) as Prisma.InputJsonValue,
          })),
        })
      }

      const participants = await tx.meetingParticipant.findMany({
        where: { meetingId },
        select: { id: true, externalId: true, name: true },
      })
      const participantIdByExternalId = new Map(
        participants
          .filter((p) => p.externalId != null)
          .map((p) => [p.externalId as string, p.id])
      )

      if (segments.length > 0) {
        for (const segment of segments) {
          const created = await tx.transcriptSegment.create({
            data: {
              meetingId,
              index: segment.index,
              participantId: segment.participantExternalId
                ? (participantIdByExternalId.get(
                    segment.participantExternalId
                  ) ?? null)
                : null,
              languageCode: segment.languageCode,
              startMs: segment.startMs,
              endMs: segment.endMs,
              text: segment.text,
            },
            select: { id: true },
          })

          if (segment.words.length > 0) {
            await tx.transcriptWord.createMany({
              data: segment.words.map((word) => ({
                segmentId: created.id,
                text: word.text,
                startMs: word.startMs,
                endMs: word.endMs,
                position: word.position,
              })),
            })
          }
        }
      }

      await tx.meetingTranscriptRaw.upsert({
        where: { meetingId },
        update: {
          provider: "recall",
          payload: transcriptJson as object,
        },
        create: {
          meetingId,
          provider: "recall",
          payload: transcriptJson as object,
        },
      })

      await tx.meeting.update({
        where: { id: meetingId },
        data: {
          status: "TRANSCRIBED",
          ...(audioKey ? { audioKey } : {}),
          durationSeconds:
            segments.length > 0
              ? Math.round(maxEndMs(segments) / 1000) || null
              : null,
          language: inferredLanguage,
        },
      })
    })

    const durationSeconds =
      segments.length > 0 ? Math.round(maxEndMs(segments) / 1000) || null : null

    await recordTranscriptionBillingUsage({
      workspaceId,
      meetingId,
      durationSeconds,
    })

    await createProcessingEventAndPublish({
      meetingId,
      stage: "TRANSCRIBE",
      status: "SUCCEEDED",
      message: `imported ${segments.length} segments in ${Math.round(
        durationMs / 1000
      )}s`,
      metadata: {
        source: "recall",
        externalBotId,
        transcriptId: transcriptId ?? null,
        transcriptBackupKey,
        segmentCount: segments.length,
        durationMs,
      },
    })

    // Skip transcribe + diarize stages — Recall has already done both.
    await getQueue(QueueName.Analyze).add(
      "analyze",
      { meetingId, workspaceId, userId, traceId },
      { jobId: `analyze-${meetingId}` }
    )

    log.info(
      { durationMs, segmentCount: segments.length },
      "import-bot-transcript completed"
    )
    return { meetingId }
  } catch (err) {
    log.error({ err }, "import-bot-transcript job failed")

    await prisma.meeting
      .update({ where: { id: meetingId }, data: { status: "FAILED" } })
      .catch(() => {})

    await createProcessingEventAndPublish({
      meetingId,
      stage: "TRANSCRIBE",
      status: "FAILED",
      message: (err as Error).message,
      metadata: {
        error: (err as Error).message,
        source: "recall",
        externalBotId,
      },
    }).catch(() => {})

    return { meetingId }
  }
}
