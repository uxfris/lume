import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import * as botsService from "./bots.service"
import {
  botErrorSchema,
  startBotMeetingBodySchema,
  startBotMeetingResponseSchema,
} from "./bots.schema"

/**
 * Mounted under `/meetings` so the public endpoint reads
 * `POST /meetings/bot` per the Phase 8 plan.
 */
export const botsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/bot",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
          keyGenerator: (request) => request.user?.id ?? request.ip,
        },
      },
      schema: {
        tags: ["Bots"],
        summary: "Dispatch a Recall.ai bot to a Zoom/Meet/Teams call",
        body: startBotMeetingBodySchema,
        response: {
          201: startBotMeetingResponseSchema,
          400: botErrorSchema,
          422: botErrorSchema,
          502: botErrorSchema,
          503: botErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await botsService.startBotMeeting({
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        meetingUrl: request.body.meetingUrl,
        scheduledAt: request.body.scheduledAt,
        title: request.body.title,
      })

      if (!result.ok) {
        const status =
          result.error === "UNSUPPORTED_PLATFORM"
            ? 422
            : result.error === "RECALL_NOT_CONFIGURED"
              ? 503
              : 502
        return reply.status(status).send({
          error: result.error,
          ...(result.message ? { message: result.message } : {}),
        })
      }

      return reply.status(201).send({
        meetingId: result.meetingId,
        status: result.status,
        externalBotId: result.externalBotId,
        platform: result.platform,
      })
    }
  )
}
