import * as Sentry from "@sentry/node"
import { env } from "../config/env"

let initialized = false

/**
 * Initialize Sentry as early as possible (before Fastify is constructed) so
 * the auto-instrumentation can wrap http/fastify/postgres modules.
 *
 * Safe to call multiple times: subsequent calls are no-ops.
 *
 * No-ops when `SENTRY_DSN_API` is unset (dev convenience).
 */
export function initSentry(): void {
  if (initialized) return
  if (!env.SENTRY_DSN_API) return

  Sentry.init({
    dsn: env.SENTRY_DSN_API,
    environment: env.NODE_ENV,
    release: env.GIT_SHA,
    // Modest default; tune in dashboard once we see traffic.
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 0,
    profilesSampleRate: 0,
    sendDefaultPii: false,
  })

  initialized = true
}

export { Sentry }
