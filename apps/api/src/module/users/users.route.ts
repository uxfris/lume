import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import {
  getMeResponseSchema,
  presignAvatarBodySchema,
  presignAvatarResponseSchema,
  updateUserBodySchema,
  updateUserResponseSchema,
} from "./users.schema"
import * as usersService from "./users.service"

const avatarErrorSchema = z.object({
  error: z.string(),
})

export const userRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/me",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Users"],
        summary: "Get current user profile and workspace memberships",
        response: {
          200: getMeResponseSchema,
        },
      },
    },
    async (request) => {
      return usersService.getMe({
        user: request.user!,
        workspaceIdHeader: request.headers["x-workspace-id"],
      })
    }
  )

  app.patch(
    "/",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Users"],
        summary: "Update current user profile",
        body: updateUserBodySchema,
        response: {
          200: updateUserResponseSchema,
        },
      },
    },
    async (request) => {
      return usersService.updateProfile({
        userId: request.user!.id,
        name: request.body.name,
      })
    }
  )

  app.post(
    "/avatar/presign",
    {
      preHandler: [app.verifySession],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
          keyGenerator: (request) => request.user?.id ?? request.ip,
        },
      },
      schema: {
        tags: ["Users"],
        summary: "Create a presigned S3 URL for the current user's avatar",
        body: presignAvatarBodySchema,
        response: {
          201: presignAvatarResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await usersService.presignAvatar({
        userId: request.user!.id,
        contentType: request.body.contentType,
      })

      return reply.status(201).send({
        uploadUrl: result.url,
        imageUrl: result.imageUrl,
        expiresInSeconds: result.expiresInSeconds,
      })
    }
  )

  app.post(
    "/avatar/complete",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Users"],
        summary: "Finalize avatar upload and attach the image to the user profile",
        response: {
          200: updateUserResponseSchema,
          400: avatarErrorSchema,
          422: avatarErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await usersService.completeAvatar({
        userId: request.user!.id,
      })

      if (!result.ok) {
        if (result.error === "OBJECT_NOT_IN_S3") {
          return reply.status(422).send({ error: "OBJECT_NOT_IN_S3" })
        }
        if (result.error === "FILE_TOO_LARGE") {
          return reply.status(400).send({ error: "FILE_TOO_LARGE" })
        }
        return reply.status(400).send({ error: "INVALID_CONTENT_TYPE" })
      }

      return reply.status(200).send(result.user)
    }
  )
}
