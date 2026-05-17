import "dotenv/config"
import z from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_URL: z.string(),

  AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  FRONTEND_URL: z.string(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  MICROSOFT_CLIENT_ID: z.string(),
  MICROSOFT_CLIENT_SECRET: z.string(),

  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_BASE_URL: z.string(),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  OPENAI_API_KEY: z.string(),

  STRIPE_SECRET_KEY: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
  STRIPE_PRICE_ID_STUDIO_PRO_MONTHLY: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
  STRIPE_PRICE_ID_STUDIO_PRO_YEARLY: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
  STRIPE_WEBHOOK_SECRET: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),

  // Phase 8 — Recall.ai
  /** Public API key. Optional in dev so the API still boots without bot support. */
  RECALL_API_KEY: z.string().optional(),
  /** Webhook signing secret (whsec_<base64>) issued by the Recall dashboard. */
  RECALL_WEBHOOK_SECRET: z.string().optional(),
  /** Region-aware Recall API base, e.g. https://us-east-1.recall.ai/api/v1. */
  RECALL_API_URL: z.url().default("https://us-west-2.recall.ai/api/v1"),
  /** Display name the bot uses when joining meetings. */
  RECALL_BOT_NAME: z.string().default("Lume Notetaker"),
  /**
   * Public HTTPS URL where Recall should POST live `transcript.data` events.
   * Leave unset to disable real-time streaming and rely solely on the
   * post-call `transcript.done` import path.
   */
  RECALL_REALTIME_WEBHOOK_URL: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.url().optional()
  ),

  // Phase 12 — Observability
  /** Sentry DSN for the API process. Leave empty in dev to disable. */
  SENTRY_DSN_API: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
  /**
   * Commit SHA injected by the deploy pipeline. Used as the Sentry release
   * tag so issues can be grouped per deploy.
   */
  GIT_SHA: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  /** Resend API key for transactional email (meeting share invites). */
  RESEND_API_KEY: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
  /** Sender address, e.g. `Lume <hello@yourdomain.com>`. */
  RESEND_FROM_EMAIL: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),

  TWILLIO_ACCOUNT_SID: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
  TWILLIO_AUTH_TOKEN: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
  TWILLIO_PHONE_NUMBER: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
  ),
})

export const env = envSchema.parse(process.env)
