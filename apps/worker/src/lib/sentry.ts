import * as Sentry from "@sentry/node"

let initialized = false

/**
 * Initialize Sentry for the worker process. Must be called before any
 * BullMQ / DB / OpenAI imports for instrumentation to work.
 *
 * No-ops when SENTRY_DSN_WORKER is unset.
 */
export function initSentry(): void {
  if (initialized) return

  const dsn = process.env.SENTRY_DSN_WORKER
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.GIT_SHA,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    profilesSampleRate: 0,
    sendDefaultPii: false,
  })

  initialized = true
}

export { Sentry }
