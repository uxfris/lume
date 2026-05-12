import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import * as channelService from "./channel.service"
import {
  channelErrorSchema,
  channelParamsSchema,
  channelSchema,
  createChannelBodySchema,
  createChannelResponseSchema,
  listChannelMeetingsQuerySchema,
  listChannelMeetingsResponseSchema,
  listChannelsResponseSchema,
  patchChannelBodySchema,
  removeChannelMeetingsBodySchema,
  updateChannelMeetingsBodySchema,
  updateChannelMeetingsResponseSchema,
} from "./channel.schema"

export const channelRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "Create a channel",
        body: createChannelBodySchema,
        response: {
          201: createChannelResponseSchema,
          409: channelErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await channelService.createChannel({
        workspaceId: request.workspace!.id,
        creatorId: request.user!.id,
        name: request.body.name,
        description: request.body.description,
        type: request.body.type ?? "PUBLIC",
      })

      if (!result.ok) {
        return reply.status(409).send({
          error: "CHANNEL_NAME_CONFLICT",
          message: result.message,
        })
      }

      return reply.status(201).send({ channel: result.channel })
    }
  )

  app.get(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "List channels in current workspace",
        response: {
          200: listChannelsResponseSchema,
        },
      },
    },
    async (request) => {
      return channelService.listChannels({
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
      })
    }
  )

  app.get(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "Get a single channel",
        params: channelParamsSchema,
        response: {
          200: channelSchema,
          404: channelErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const channel = await channelService.getChannelById({
        channelId: request.params.id,
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
      })

      if (!channel) {
        return reply.status(404).send({ error: "CHANNEL_NOT_FOUND" })
      }

      return channel
    }
  )

  app.patch(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "Update channel metadata",
        params: channelParamsSchema,
        body: patchChannelBodySchema,
        response: {
          204: z.undefined(),
          404: channelErrorSchema,
          409: channelErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await channelService.updateChannel({
        channelId: request.params.id,
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        name: request.body.name,
        description: request.body.description,
        type: request.body.type,
      })

      if (!result.ok) {
        if (result.reason === "NAME_CONFLICT") {
          return reply.status(409).send({
            error: "CHANNEL_NAME_CONFLICT",
            message: result.message,
          })
        }
        return reply.status(404).send({ error: "CHANNEL_NOT_FOUND" })
      }

      return reply.status(204).send()
    }
  )
  app.delete(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "Delete channel",
        params: channelParamsSchema,
        response: {
          204: z.undefined(),
          404: channelErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await channelService.deleteChannel({
        channelId: request.params.id,
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
      })

      if (!result.ok) {
        return reply.status(404).send({ error: "CHANNEL_NOT_FOUND" })
      }

      return reply.status(204).send()
    }
  )

  app.get(
    "/:id/meetings",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "List meetings currently assigned to a channel",
        params: channelParamsSchema,
        querystring: listChannelMeetingsQuerySchema,
        response: {
          200: listChannelMeetingsResponseSchema,
          404: channelErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await channelService.listChannelMeetings({
        channelId: request.params.id,
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        limit: request.query.limit,
      })

      if (!result.ok) {
        return reply.status(404).send({ error: "CHANNEL_NOT_FOUND" })
      }

      return { meetings: result.meetings }
    }
  )
  app.post(
    "/:id/meetings",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "Assign meetings to a channel",
        params: channelParamsSchema,
        body: updateChannelMeetingsBodySchema,
        response: {
          200: updateChannelMeetingsResponseSchema,
          404: channelErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await channelService.addMeetingsToChannel({
        channelId: request.params.id,
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        meetingIds: request.body.meetingIds,
      })

      if (!result.ok) {
        return reply.status(404).send({ error: "CHANNEL_NOT_FOUND" })
      }

      return reply.status(200).send({ updatedCount: result.updatedCount })
    }
  )

  app.delete(
    "/:id/meetings",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "Remove meetings from a channel",
        params: channelParamsSchema,
        body: removeChannelMeetingsBodySchema,
        response: {
          200: updateChannelMeetingsResponseSchema,
          404: channelErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await channelService.removeMeetingsFromChannel({
        channelId: request.params.id,
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        meetingIds: request.body?.meetingIds,
      })

      if (!result.ok) {
        return reply.status(404).send({ error: "CHANNEL_NOT_FOUND" })
      }

      return reply.status(200).send({ updatedCount: result.updatedCount })
    }
  )
}
