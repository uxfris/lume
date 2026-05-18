import {
  ACCOUNT_DELETION_GRACE_MS,
  accountDeletionJobId,
} from "@workspace/account-deletion"
import { QueueName, getQueue } from "@workspace/queue"

export async function enqueueAccountDeletionJob(userId: string) {
  const queue = getQueue(QueueName.DeleteAccount)
  const jobId = accountDeletionJobId(userId)

  const existing = await queue.getJob(jobId)
  if (existing) {
    await existing.remove()
  }

  await queue.add(
    "execute",
    { userId },
    {
      jobId,
      delay: ACCOUNT_DELETION_GRACE_MS,
    }
  )
}

export async function removeAccountDeletionJob(userId: string) {
  const queue = getQueue(QueueName.DeleteAccount)
  const job = await queue.getJob(accountDeletionJobId(userId))
  if (job) {
    await job.remove()
  }
}
