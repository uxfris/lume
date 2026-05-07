import "dotenv/config"
import "./config/env"
import {
  QueueName,
  closeAllQueues,
  closeRedisConnection,
  createWorker,
} from "@workspace/queue"
import { logger } from "./logger"
import { transcribeHandler } from "./handlers/transcribe"
import { diarizeHandler } from "./handlers/diarize"
import { analyzeHandler } from "./handlers/analyze"
import { embedHandler } from "./handlers/embed"
import { importBotTranscriptHandler } from "./handlers/import-bot-transcript"

const transcribeWorker = createWorker(QueueName.Transcribe, transcribeHandler)
const diarizeWorker = createWorker(QueueName.Diarize, diarizeHandler)
const analyzeWorker = createWorker(QueueName.Analyze, analyzeHandler)
const embedWorker = createWorker(QueueName.Embed, embedHandler)
const importBotTranscriptWorker = createWorker(
  QueueName.ImportBotTranscript,
  importBotTranscriptHandler
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

transcribeWorker.on("failed", (job, err) => {
  logger.error(
    { queue: QueueName.Transcribe, jobId: job?.id, err },
    "job failed after retries"
  )
})
diarizeWorker.on("failed", (job, err) => {
  logger.error(
    { queue: QueueName.Diarize, jobId: job?.id, err },
    "job failed after retries"
  )
})
analyzeWorker.on("failed", (job, err) => {
  logger.error(
    { queue: QueueName.Analyze, jobId: job?.id, err },
    "job failed after retries"
  )
})
embedWorker.on("failed", (job, err) => {
  logger.error(
    { queue: QueueName.Embed, jobId: job?.id, err },
    "job failed after retries"
  )
})
importBotTranscriptWorker.on("failed", (job, err) => {
  logger.error(
    { queue: QueueName.ImportBotTranscript, jobId: job?.id, err },
    "job failed after retries"
  )
})

logger.info("worker online")

async function shutdown(signal: string) {
  logger.info({ signal }, "shutting down worker")
  try {
    await transcribeWorker.close()
    await diarizeWorker.close()
    await analyzeWorker.close()
    await embedWorker.close()
    await importBotTranscriptWorker.close()
    await closeAllQueues()
    await closeRedisConnection()
  } catch (err) {
    logger.error({ err }, "error during shutdown")
  } finally {
    process.exit(0)
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"))
process.on("SIGTERM", () => void shutdown("SIGTERM"))
