import { initSentry } from "./lib/sentry"

// IMPORTANT: initialize Sentry before any other module that we want
// auto-instrumented (http, fastify, pg). Has to happen at import time.
initSentry()

import { buildApp } from "./app"
import { env } from "./config/env"

async function start() {
  const app = await buildApp()

  await app.listen({
    port: env.PORT,
    host: env.HOST,
  })
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("api failed to start", err)
  process.exit(1)
})
