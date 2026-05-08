import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import {
  calendarErrorSchema,
  connectCalendarBodySchema,
  connectCalendarResponseSchema,
  listUpcomingQuerySchema,
  listUpcomingResponseSchema,
} from "./calendar.schema"
import { connectCalendar, listUpcomingMeetings } from "./calendar.service"

export const calendarRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/connect",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Calendar"],
        summary: "Connect a Recall Calendar V2 source for current user",
        body: connectCalendarBodySchema,
        response: {
          201: connectCalendarResponseSchema,
          400: calendarErrorSchema,
          404: calendarErrorSchema,
          422: calendarErrorSchema,
          503: calendarErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await connectCalendar({
        userId: request.user!.id,
        provider: request.body.provider,
      })
      if (!result.ok) {
        const status =
          result.error === "RECALL_NOT_CONFIGURED"
            ? 503
            : result.error === "ACCOUNT_NOT_CONNECTED"
              ? 404
              : result.error === "REFRESH_TOKEN_MISSING"
                ? 422
                : 400
        return reply.status(status).send({
          error: result.error,
          ...(result.message ? { message: result.message } : {}),
        })
      }

      return reply.status(201).send(result)
    }
  )

  app.get(
    "/upcoming",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Calendar"],
        summary: "List upcoming meetings from synced calendar events",
        querystring: listUpcomingQuerySchema,
        response: {
          200: listUpcomingResponseSchema,
          400: calendarErrorSchema,
        },
      },
    },
    async (request) => {
      return listUpcomingMeetings({
        workspaceId: request.workspace!.id,
        days: request.query.days,
        limit: request.query.limit,
      })
    }
  )
}
