import { prisma } from "@workspace/database"
import { extractStatusCode } from "../recall-webhook-payload"
import type { RecallEventResult } from "../recall-webhook.types"
import type { MeetingRecallContext } from "./context"

export async function handleTranscriptFailedOrBotFatal(
  ctx: MeetingRecallContext,
  eventType: "transcript.failed" | "bot.fatal"
): Promise<RecallEventResult> {
  const { meeting, payload } = ctx
  const subCode = extractStatusCode(payload)
  await prisma.meeting.update({
    where: { id: meeting.id },
    data: { status: "FAILED" },
  })
  await prisma.processingEvent.create({
    data: {
      meetingId: meeting.id,
      stage: "TRANSCRIBE",
      status: "FAILED",
      message: `Recall reported ${eventType}`,
      metadata: { event: eventType, code: subCode ?? null },
    },
  })
  return { ok: true, meetingId: meeting.id, action: "FAILED" }
}
