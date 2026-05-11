import { prisma } from "@workspace/database"
import { QueueName, getQueue } from "@workspace/queue"
import { extractBotId, extractTranscriptId } from "../recall-webhook-payload"
import type { RecallEventResult } from "../recall-webhook.types"
import type { MeetingRecallContext } from "./context"

export async function handleTranscriptDone(
  ctx: MeetingRecallContext
): Promise<RecallEventResult> {
  const { meeting, payload, traceId } = ctx

  // Idempotent: only run once per meeting.
  if (meeting.status !== "TRANSCRIBING") {
    return { ok: false, reason: "ALREADY_PROCESSED" }
  }
  if (!meeting.externalBotId) {
    // Backfill in case the user hit /meetings/bot before the dispatch
    // completed (unlikely race) — `data.bot.id` is the source of truth.
    const botId = extractBotId(payload)
    if (botId) {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { externalBotId: botId },
      })
    }
  }

  const transcriptId = extractTranscriptId(payload)
  const externalBotId = meeting.externalBotId ?? extractBotId(payload) ?? ""

  await getQueue(QueueName.ImportBotTranscript).add(
    "import-bot-transcript",
    {
      meetingId: meeting.id,
      workspaceId: meeting.workspaceId,
      userId: meeting.userId,
      externalBotId,
      ...(transcriptId ? { transcriptId } : {}),
      traceId,
    },
    { jobId: `import-bot-transcript-${meeting.id}` }
  )
  return { ok: true, meetingId: meeting.id, action: "TRANSCRIPT_IMPORTED" }
}
