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

  // Phase 8 — Recall.ai
  RECALL_API_KEY: z.string().optional(),
  RECALL_API_URL: z.url().default("https://us-west-2.recall.ai/api/v1"),
})

export const env = envSchema.parse(process.env)
