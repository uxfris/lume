import fp from "fastify-plugin"
import { createAuth } from "@workspace/auth"
import { env } from "../config/env"
import { fromNodeHeaders } from "better-auth/node"
import { syncRecallCalendarsForUser } from "../module/calendar/calendar.service"

export default fp(async (app) => {
  const auth = createAuth({
    baseUrl: env.AUTH_URL,
    betterAuthSecret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.FRONTEND_URL],
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
    },
    afterSessionCreated: async ({ userId }) => {
      try {
        await syncRecallCalendarsForUser(userId)
      } catch (err) {
        app.log.warn(
          { err, userId },
          "Recall Calendar V2 sync after session failed"
        )
      }
    },
  })

  app.decorate("auth", auth)

  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    config: {
      // Tighter limit on auth endpoints: deters credential stuffing /
      // password-spray. Counts per-IP via @fastify/rate-limit defaults.
      rateLimit: {
        max: 5,
        timeWindow: "1 minute",
      },
    },
    async handler(request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, `http://${request.headers.host}`)

        // Convert Fastify headers to standard Headers object
        const headers = fromNodeHeaders(request.headers)
        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        })
        // Process authentication request
        const response = await auth.handler(req)

        // Forward response to client
        reply.status(response.status)
        response.headers.forEach((value, key) => reply.header(key, value))
        reply.send(response.body ? await response.text() : null)
      } catch (error) {
        app.log.error(`Authentication Error: ${error}`)
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        })
      }
    },
  })
})
