import { executeAccountDeletion } from "@workspace/account-deletion"
import { prisma } from "@workspace/database"
import type { DeleteAccountJobPayload } from "@workspace/queue"
import type { Job } from "bullmq"
import { logger } from "../logger"

export async function deleteAccountHandler(
  job: Job<DeleteAccountJobPayload, unknown, "execute">
): Promise<void> {
  const { userId } = job.data

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { scheduledDeletionAt: true },
  })

  if (!user?.scheduledDeletionAt) {
    logger.info({ userId, jobId: job.id }, "account deletion skipped: not scheduled")
    return
  }

  const now = new Date()
  if (user.scheduledDeletionAt > now) {
    const delayMs = user.scheduledDeletionAt.getTime() - now.getTime()
    logger.info(
      { userId, jobId: job.id, delayMs },
      "account deletion delayed: grace period not elapsed"
    )
    throw new Error("ACCOUNT_DELETION_NOT_DUE")
  }

  await executeAccountDeletion(userId)
  logger.info({ userId, jobId: job.id }, "account deleted")
}
