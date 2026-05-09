import Fastify from "fastify"
import fastifySSEPlugin from "fastify-sse-v2"
import swaggerPlugin from "./plugins/swagger"
import multipartPlugin from "./plugins/multipart"
import { registerRoute } from "./routes"
import { registerErrorHandler } from "./middleware/error-handler"
import rateLimitPlugin from "./plugins/rate-limit"
import betterAuthPlugin from "./plugins/better-auth"
import sessionPlugin from "./plugins/session"
import workspaceAccessPlugin from "./plugins/workspace-access"
import billingQuotaPlugin from "./plugins/billing-quota"
import corsPlugin from "./plugins/cors"
import requestIdPlugin, { genReqId } from "./plugins/request-id"
import bullBoardPlugin from "./plugins/bull-board"
import { registerZod } from "./lib/zod"
import rawBodyPlugin from "./plugins/raw-body"
import helmetPlugin from "./plugins/helmet"
import { env } from "./config/env"

export async function buildApp() {
  const isProd = env.NODE_ENV === "production"

  const app = Fastify({
    genReqId,
    logger: {
      level: env.LOG_LEVEL,
      // Production: structured JSON, ready to be shipped to Better Stack /
      // Axiom. Dev: pino-pretty for readable console output.
      ...(isProd
        ? {
            redact: {
              paths: [
                "req.headers.authorization",
                "req.headers.cookie",
                'req.headers["x-recall-signature"]',
                'req.headers["stripe-signature"]',
              ],
              censor: "[REDACTED]",
            },
          }
        : {
            transport: { target: "pino-pretty" },
          }),
    },
    // Trust the proxy for client IP / protocol — needed once we sit behind
    // Railway / Cloudflare so rate-limit and HTTPS-redirects work correctly.
    trustProxy: isProd,
  })

  await app.register(requestIdPlugin)
  await app.register(helmetPlugin)
  // Rate-limit must be registered before any route that opts into a stricter
  // per-route limit via `config.rateLimit` (e.g. /api/auth/*).
  await app.register(rateLimitPlugin)
  await app.register(betterAuthPlugin)
  await app.register(sessionPlugin)
  await app.register(workspaceAccessPlugin)
  await app.register(billingQuotaPlugin)
  await app.register(multipartPlugin)
  await app.register(rawBodyPlugin)
  await app.register(corsPlugin)
  await app.register(fastifySSEPlugin)

  registerZod(app)
  await registerErrorHandler(app)
  await app.register(swaggerPlugin)
  await app.register(bullBoardPlugin)
  await registerRoute(app)

  return app
}
