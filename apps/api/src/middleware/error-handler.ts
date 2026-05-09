import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify"
import { Sentry } from "../lib/sentry"

export async function registerErrorHandler(app: FastifyInstance) {
  // Wires Sentry's Fastify integration (captures unhandled errors with the
  // matching transaction/route context). No-op when SENTRY_DSN_API is unset.
  Sentry.setupFastifyErrorHandler(app)

  app.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      const status = error.statusCode || 500

      // Validation errors (400-class) are user errors, not regressions: log
      // at warn level and skip Sentry to keep the issue stream clean.
      if (status >= 500) {
        request.log.error({ err: error, reqId: request.id }, "request failed")
      } else {
        request.log.warn({ err: error, reqId: request.id }, "request rejected")
      }

      return reply.status(status).send({
        error: error.name,
        message: error.message,
        trace_id: request.id,
      })
    }
  )
}
