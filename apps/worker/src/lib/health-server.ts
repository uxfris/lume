import http from "node:http"
import { QueueName, getQueue } from "@workspace/queue"
import { logger } from "../logger"

const QUEUE_NAMES = [
  QueueName.Transcribe,
  QueueName.Diarize,
  QueueName.Analyze,
  QueueName.Embed,
  QueueName.ImportBotTranscript,
]

const COUNTER_STATES = ["waiting", "active", "delayed", "failed", "completed"] as const

/**
 * Tiny HTTP server for Railway health checks + Prometheus scraping. The
 * worker is otherwise headless. Listens on `WORKER_HEALTH_PORT` (default
 * 9100); the Railway service config should point its healthcheck here.
 */
export function startHealthServer(port: number): http.Server {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.statusCode = 404
      res.end()
      return
    }

    if (req.url === "/health" || req.url === "/healthz") {
      res.statusCode = 200
      res.setHeader("content-type", "application/json")
      res.end(
        JSON.stringify({
          status: "ok",
          service: "lume-worker",
          uptime: process.uptime(),
        })
      )
      return
    }

    if (req.url === "/metrics") {
      try {
        const lines: string[] = []
        lines.push(
          "# HELP lume_queue_jobs Number of jobs in a BullMQ queue, by state."
        )
        lines.push("# TYPE lume_queue_jobs gauge")
        for (const name of QUEUE_NAMES) {
          const counts = await getQueue(name).getJobCounts(...COUNTER_STATES)
          for (const state of COUNTER_STATES) {
            const value = Number(
              (counts as Record<string, number>)[state] ?? 0
            )
            lines.push(
              `lume_queue_jobs{queue="${name}",state="${state}"} ${value}`
            )
          }
        }
        const mem = process.memoryUsage()
        lines.push(
          "# HELP lume_worker_resident_memory_bytes RSS for the worker process."
        )
        lines.push("# TYPE lume_worker_resident_memory_bytes gauge")
        lines.push(`lume_worker_resident_memory_bytes ${mem.rss}`)
        lines.push("# HELP lume_worker_uptime_seconds Worker uptime, in seconds.")
        lines.push("# TYPE lume_worker_uptime_seconds counter")
        lines.push(`lume_worker_uptime_seconds ${process.uptime()}`)

        res.statusCode = 200
        res.setHeader("content-type", "text/plain; version=0.0.4; charset=utf-8")
        res.end(lines.join("\n") + "\n")
      } catch (err) {
        logger.error({ err }, "metrics scrape failed")
        res.statusCode = 503
        res.end("# metrics unavailable\n")
      }
      return
    }

    res.statusCode = 404
    res.end()
  })

  server.listen(port, () => {
    logger.info({ port }, "worker health server listening")
  })

  return server
}
