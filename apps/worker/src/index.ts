import "dotenv/config"
import { initSentry, Sentry } from "./lib/sentry"

// Sentry must initialize before BullMQ / OpenAI / Prisma so its OpenTelemetry
// auto-instrumentation can patch them.
initSentry()

import { env } from "./config/env"
import {
  QueueName,
  closeAllQueues,
  closeRedisConnection,
  createWorker,
} from "@workspace/queue"
import { logger } from "./logger"
import { startHealthServer } from "./lib/health-server"
import { transcribeHandler } from "./handlers/transcribe"
import { diarizeHandler } from "./handlers/diarize"
import { analyzeHandler } from "./handlers/analyze"
import { embedHandler } from "./handlers/embed"
import { importBotTranscriptHandler } from "./handlers/import-bot-transcript"
import { deleteAccountHandler } from "./handlers/delete-account"
import { sweepDueAccountDeletions } from "./lib/account-deletion-sweeper"
import { deliverIntegrationsHandler } from "./handlers/deliver-integrations"

const healthServer = startHealthServer(env.WORKER_HEALTH_PORT)

const transcribeWorker = createWorker(QueueName.Transcribe, transcribeHandler)
const diarizeWorker = createWorker(QueueName.Diarize, diarizeHandler)
const analyzeWorker = createWorker(QueueName.Analyze, analyzeHandler)
const embedWorker = createWorker(QueueName.Embed, embedHandler)
const importBotTranscriptWorker = createWorker(
  QueueName.ImportBotTranscript,
  importBotTranscriptHandler
)
const deleteAccountWorker = createWorker(
  QueueName.DeleteAccount,
  deleteAccountHandler,
  { concurrency: 1 }
)
const deliverIntegrationsWorker = createWorker(
  QueueName.DeliverIntegrations,
  deliverIntegrationsHandler
)

transcribeWorker.on("ready", () => {
  logger.info({ queue: QueueName.Transcribe }, "worker ready")
})
diarizeWorker.on("ready", () => {
  logger.info({ queue: QueueName.Diarize }, "worker ready")
})
analyzeWorker.on("ready", () => {
  logger.info({ queue: QueueName.Analyze }, "worker ready")
})
embedWorker.on("ready", () => {
  logger.info({ queue: QueueName.Embed }, "worker ready")
})
importBotTranscriptWorker.on("ready", () => {
  logger.info({ queue: QueueName.ImportBotTranscript }, "worker ready")
})
deleteAccountWorker.on("ready", () => {
  logger.info({ queue: QueueName.DeleteAccount }, "worker ready")
})
deliverIntegrationsWorker.on("ready", () => {
  logger.info({ queue: QueueName.DeliverIntegrations }, "worker ready")
})

function reportFailedJob(queue: string, job: { id?: string } | undefined, err: Error) {
  logger.error({ queue, jobId: job?.id, err }, "job failed after retries")
  Sentry.captureException(err, {
    tags: { queue },
    extra: { jobId: job?.id },
  })
}

transcribeWorker.on("failed", (job, err) =>
  reportFailedJob(QueueName.Transcribe, job, err as Error)
)
diarizeWorker.on("failed", (job, err) =>
  reportFailedJob(QueueName.Diarize, job, err as Error)
)
analyzeWorker.on("failed", (job, err) =>
  reportFailedJob(QueueName.Analyze, job, err as Error)
)
embedWorker.on("failed", (job, err) =>
  reportFailedJob(QueueName.Embed, job, err as Error)
)
importBotTranscriptWorker.on("failed", (job, err) =>
  reportFailedJob(QueueName.ImportBotTranscript, job, err as Error)
)
deleteAccountWorker.on("failed", (job, err) =>
  reportFailedJob(QueueName.DeleteAccount, job, err as Error)
)
deliverIntegrationsWorker.on("failed", (job, err) =>
  reportFailedJob(QueueName.DeliverIntegrations, job, err as Error)
)

const ACCOUNT_DELETION_SWEEP_MS = 60 * 60 * 1000
const accountDeletionSweepTimer = setInterval(() => {
  void sweepDueAccountDeletions()
}, ACCOUNT_DELETION_SWEEP_MS)

void sweepDueAccountDeletions()

logger.info("worker online")

async function shutdown(signal: string) {
  logger.info({ signal }, "shutting down worker")
  try {
    healthServer.close()
    await transcribeWorker.close()
    await diarizeWorker.close()
    await analyzeWorker.close()
    await embedWorker.close()
    await importBotTranscriptWorker.close()
    await deleteAccountWorker.close()
    await deliverIntegrationsWorker.close()
    clearInterval(accountDeletionSweepTimer)
    await closeAllQueues()
    await closeRedisConnection()
    // Flush in-flight Sentry events before exiting (otherwise we lose the
    // trail of any error that triggered the shutdown).
    await Sentry.flush(2_000)
  } catch (err) {
    logger.error({ err }, "error during shutdown")
  } finally {
    process.exit(0)
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"))
process.on("SIGTERM", () => void shutdown("SIGTERM"))
