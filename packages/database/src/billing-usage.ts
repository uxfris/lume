import { prisma } from "./client"

/** UTC calendar month key for usage rows (YYYY-MM). */
export function utcBillingPeriod(now: Date = new Date()): string {
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth() + 1
  return `${y}-${m < 10 ? `0${m}` : String(m)}`
}

/**
 * Billable minutes from audio duration: at least 1 minute when any transcription ran.
 */
export function transcribedMinutesFromDuration(
  durationSeconds: number | null | undefined
): number {
  if (durationSeconds == null || durationSeconds <= 0) {
    return 1
  }
  return Math.max(1, Math.ceil(durationSeconds / 60))
}

/**
 * Applies one meeting’s transcription to `UsageCounter` at most once per meeting.
 */
export async function recordTranscriptionBillingUsage(input: {
  workspaceId: string
  meetingId: string
  durationSeconds: number | null | undefined
}): Promise<void> {
  const minutesToAdd = transcribedMinutesFromDuration(input.durationSeconds)
  const period = utcBillingPeriod()

  await prisma.$transaction(async (tx) => {
    const marked = await tx.meeting.updateMany({
      where: {
        id: input.meetingId,
        workspaceId: input.workspaceId,
        billingUsageRecorded: false,
      },
      data: { billingUsageRecorded: true },
    })

    if (marked.count === 0) {
      return
    }

    await tx.usageCounter.upsert({
      where: {
        workspaceId_period: {
          workspaceId: input.workspaceId,
          period,
        },
      },
      create: {
        workspaceId: input.workspaceId,
        period,
        minutesTranscribed: minutesToAdd,
        meetingsTranscribed: 1,
      },
      update: {
        minutesTranscribed: { increment: minutesToAdd },
        meetingsTranscribed: { increment: 1 },
      },
    })
  })
}
