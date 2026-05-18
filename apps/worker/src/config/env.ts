import "dotenv/config"
import z from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET: z.string(),
  WHISPER_URL: z.url(),
  PYANNOTE_URL: z.url(),
  OPENAI_API_KEY: z.string().min(1),

  /** Used in Slack / Linear delivery messages. */
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Phase 8 — Recall.ai
  RECALL_API_KEY: z.string().optional(),
  RECALL_API_URL: z.url().default("https://us-west-2.recall.ai/api/v1"),

  // Phase 12 — Observability + deployment
  /** Sentry DSN for the worker process. Leave empty to disable. */
  SENTRY_DSN_WORKER: z.string().optional(),
  /** Commit SHA injected by deploy pipeline (Sentry release tag). */
  GIT_SHA: z.string().optional(),
  /** Port for the worker's tiny HTTP server (health + metrics). */
  WORKER_HEALTH_PORT: z.coerce.number().int().positive().default(9100),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
})

export const env = envSchema.parse(process.env)
