import { FastifyInstance } from "fastify"
import { QueueName, getQueue } from "@workspace/queue"

/**
 * Minimal Prometheus exposition. We deliberately avoid `prom-client` for
 * Phase 12: the only metrics that matter operationally today are queue
 * depths (so we know when to scale workers) and the runtime resource
 * basics. Drop in `prom-client` later if we need histograms.
 */

const QUEUE_NAMES = [
  QueueName.Transcribe,
  QueueName.Diarize,
  QueueName.Analyze,
  QueueName.Embed,
  QueueName.ImportBotTranscript,
  QueueName.DeleteAccount,
]

const COUNTER_STATES = ["waiting", "active", "delayed", "failed", "completed"] as const

type CounterState = (typeof COUNTER_STATES)[number]

async function readQueueCounters(): Promise<
  Array<{ queue: string; state: CounterState; count: number }>
> {
  const out: Array<{ queue: string; state: CounterState; count: number }> = []
  for (const name of QUEUE_NAMES) {
    const queue = getQueue(name)
    const counts = await queue.getJobCounts(...COUNTER_STATES)
    for (const state of COUNTER_STATES) {
      out.push({
        queue: name,
        state,
        count: Number((counts as Record<string, number>)[state] ?? 0),
      })
    }
  }
  return out
}

function escapeLabel(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function formatPrometheus(
  counters: Array<{ queue: string; state: CounterState; count: number }>
): string {
  const lines: string[] = []
  lines.push(
    "# HELP lume_queue_jobs Number of jobs in a BullMQ queue, by state."
  )
  lines.push("# TYPE lume_queue_jobs gauge")
  for (const c of counters) {
    lines.push(
      `lume_queue_jobs{queue="${escapeLabel(c.queue)}",state="${c.state}"} ${c.count}`
    )
  }

  const mem = process.memoryUsage()
  lines.push("# HELP lume_process_resident_memory_bytes RSS for the API process.")
  lines.push("# TYPE lume_process_resident_memory_bytes gauge")
  lines.push(`lume_process_resident_memory_bytes ${mem.rss}`)
  lines.push("# HELP lume_process_heap_used_bytes Heap usage for the API process.")
  lines.push("# TYPE lume_process_heap_used_bytes gauge")
  lines.push(`lume_process_heap_used_bytes ${mem.heapUsed}`)
  lines.push(
    "# HELP lume_process_uptime_seconds Time since the API booted, in seconds."
  )
  lines.push("# TYPE lume_process_uptime_seconds counter")
  lines.push(`lume_process_uptime_seconds ${process.uptime()}`)

  return lines.join("\n") + "\n"
}

export async function metricsRoute(app: FastifyInstance) {
  app.get(
    "/metrics",
    {
      // No session required: this endpoint is meant for a Prometheus
      // scraper inside the private network. Lock down with platform-level
      // ACLs (e.g. Railway private networking) rather than auth.
      schema: {
        tags: ["System"],
        summary: "Prometheus-format metrics (queue depth, runtime).",
        hide: true,
      },
      logLevel: "warn",
    },
    async (_req, reply) => {
      try {
        const counters = await readQueueCounters()
        reply.header("content-type", "text/plain; version=0.0.4; charset=utf-8")
        return formatPrometheus(counters)
      } catch (err) {
        _req.log.error({ err }, "failed to collect metrics")
        reply.status(503)
        return "# metrics unavailable\n"
      }
    }
  )
}
