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
import corsPlugin from "./plugins/cors"
import requestIdPlugin, { genReqId } from "./plugins/request-id"
import bullBoardPlugin from "./plugins/bull-board"
import { registerZod } from "./lib/zod"
import rawBodyPlugin from "./plugins/raw-body"

export async function buildApp() {
  const app = Fastify({
    genReqId,
    logger: {
      transport: {
        target: "pino-pretty",
      },
    },
  })

  await app.register(requestIdPlugin)
  await app.register(betterAuthPlugin)
  await app.register(sessionPlugin)
  await app.register(workspaceAccessPlugin)
  await app.register(multipartPlugin)
  await app.register(rawBodyPlugin)
  await app.register(rateLimitPlugin)
  await app.register(corsPlugin)
  await app.register(fastifySSEPlugin)

  registerZod(app)
  await registerErrorHandler(app)
  await app.register(swaggerPlugin)
  await app.register(bullBoardPlugin)
  await registerRoute(app)

  return app
}
