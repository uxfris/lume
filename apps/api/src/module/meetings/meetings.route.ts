import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { getRedisConnection } from "@workspace/queue"
import { z } from "zod"
import * as meetingsService from "./meetings.service"
import {
  getConversationParamsSchema,
  getConversationResponseSchema,
  getMeetingParamsSchema,
  listLiveMeetingsResponseSchema,
  listMeetingsQuerySchema,
  listMeetingsResponseSchema,
  meetingErrorSchema,
  meetingSchema,
  patchMeetingBodySchema,
  patchMeetingParamsSchema,
} from "./meetings.schema"

export const meetingsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Meetings"],
        summary: "List meetings in current workspace (cursor pagination)",
        querystring: listMeetingsQuerySchema,
        response: {
          200: listMeetingsResponseSchema,
          400: meetingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        return await meetingsService.listMeetings({
          workspaceId: request.workspace!.id,
          userId: request.user!.id,
          cursor: request.query.cursor,
          limit: request.query.limit,
          isStarred: request.query.isStarred,
          isCreatedByMe: request.query.isCreatedByMe,
          isSharedWithMe: request.query.isSharedWithMe,
        })
      } catch (err) {
        if ((err as Error).message === "INVALID_CURSOR") {
          return reply.status(400).send({
            error: "INVALID_CURSOR",
            message: "Invalid or expired cursor.",
          })
        }
        throw err
      }
    }
  )

  app.get(
    "/live",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Meetings"],
        summary: "List live meetings in current workspace",
        response: {
          200: listLiveMeetingsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      return await meetingsService.listLiveMeetings({
        workspaceId: request.workspace!.id,
      })
    }
  )

  app.get(
    "/:id/conversation",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Meetings"],
        summary: "Get diarized conversation transcript for a meeting",
        params: getConversationParamsSchema,
        response: {
          200: getConversationResponseSchema,
          404: meetingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const conversation = await meetingsService.getConversation({
        meetingId: request.params.id,
        workspaceId: request.workspace!.id,
      })

      if (!conversation) {
        return reply.status(404).send({
          error: "MEETING_NOT_FOUND",
        })
      }

      return reply.status(200).send(conversation)
    }
  )

  app.get(
    "/:id/events",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Meetings"],
        summary: "Subscribe to meeting processing events (SSE)",
        params: getMeetingParamsSchema,
        response: {
          403: meetingErrorSchema,
          404: meetingErrorSchema,
          500: meetingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const allowed = await meetingsService.canUserAccessMeeting({
        meetingId: request.params.id,
        userId: request.user!.id,
      })

      if (!allowed) {
        return reply.status(404).send({ error: "MEETING_NOT_FOUND" })
      }

      const channel = `meeting:${request.params.id}`
      const subscriber = getRedisConnection().duplicate({ lazyConnect: true })

      try {
        if (subscriber.status === "wait") {
          await subscriber.connect()
        }
        await subscriber.subscribe(channel)
      } catch (err) {
        request.log.error(
          { err, channel },
          "failed to subscribe meeting SSE channel"
        )
        await subscriber.quit().catch(() => {})
        return reply.status(500).send({ error: "SSE_SUBSCRIBE_FAILED" })
      }

      reply.hijack()
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      })
      reply.raw.flushHeaders?.()
      reply.raw.write("event: ready\ndata: connected\n\n")

      const onMessage = (incomingChannel: string, payload: string) => {
        if (incomingChannel !== channel) return
        reply.raw.write(`event: processing.event\ndata: ${payload}\n\n`)
      }
      subscriber.on("message", onMessage)

      // Proxies/load balancers may drop idle SSE streams.
      const heartbeat = setInterval(() => {
        reply.raw.write(": heartbeat\n\n")
      }, 15000)

      const cleanup = async () => {
        clearInterval(heartbeat)
        subscriber.off("message", onMessage)
        await subscriber.unsubscribe(channel).catch(() => {})
        await subscriber.quit().catch(() => {})
      }

      request.raw.on("close", async () => {
        await cleanup()
      })
    }
  )

  app.get(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Meetings"],
        summary: "Get a single meeting for the dashboard / detail header",
        params: getMeetingParamsSchema,
        response: {
          200: meetingSchema,
          404: meetingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const meeting = await meetingsService.getMeetingById({
        meetingId: request.params.id,
        workspaceId: request.workspace!.id,
      })

      if (!meeting) {
        return reply.status(404).send({ error: "MEETING_NOT_FOUND" })
      }

      return reply.status(200).send(meeting)
    }
  )

  app.patch(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Meetings"],
        summary: "Update meeting title and sharing flags",
        params: patchMeetingParamsSchema,
        body: patchMeetingBodySchema,
        response: {
          204: z.undefined(),
          404: meetingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await meetingsService.patchMeeting({
        meetingId: request.params.id,
        workspaceId: request.workspace!.id,
        title: request.body.title,
        isShared: request.body.isShared,
        isStarred: request.body.isStarred,
      })

      if (!result.ok) {
        return reply.status(404).send({ error: "MEETING_NOT_FOUND" })
      }

      return reply.status(204).send()
    }
  )

  app.delete(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Meetings"],
        summary: "Soft-delete a meeting",
        params: getMeetingParamsSchema,
        response: {
          204: z.undefined(),
          404: meetingErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await meetingsService.deleteMeeting({
        meetingId: request.params.id,
        workspaceId: request.workspace!.id,
      })

      if (!result.ok) {
        return reply.status(404).send({ error: "MEETING_NOT_FOUND" })
      }

      return reply.status(204).send()
    }
  )
}
