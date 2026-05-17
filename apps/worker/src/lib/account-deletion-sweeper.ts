import { executeAccountDeletion } from "@workspace/account-deletion"
import { prisma } from "@workspace/database"
import { logger } from "../logger"

/**
 * Safety net for account deletions if the delayed BullMQ job was lost or failed.
 */
export async function sweepDueAccountDeletions(): Promise<void> {
  const dueUsers = await prisma.user.findMany({
    where: {
      scheduledDeletionAt: { lte: new Date() },
    },
    select: { id: true },
    take: 50,
  })

  if (dueUsers.length === 0) return

  logger.info({ count: dueUsers.length }, "sweeping due account deletions")

  for (const user of dueUsers) {
    try {
      await executeAccountDeletion(user.id)
      logger.info({ userId: user.id }, "account deleted via sweeper")
    } catch (err) {
      logger.error({ userId: user.id, err }, "account deletion sweeper failed")
    }
  }
}
