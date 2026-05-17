import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import {
  accountDeletionContextSchema,
  avatarErrorSchema,
  cancelAccountDeletionBodySchema,
  deleteAccountBodySchema,
  deleteAccountErrorSchema,
  getMeResponseSchema,
  scheduleAccountDeletionResponseSchema,
  presignAvatarBodySchema,
  presignAvatarResponseSchema,
  updateUserBodySchema,
  updateUserResponseSchema,
  userIdParamsSchema,
} from "./users.schema"
import * as usersService from "./users.service"
import { streamUserAvatar } from "../../lib/user-avatar"

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

  app.get(
    "/me/deletion-context",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Users"],
        summary: "Get data required to confirm account deletion",
        response: {
          200: accountDeletionContextSchema,
          404: deleteAccountErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await usersService.getAccountDeletionContext(
        request.user!.id
      )

      if (!result.ok) {
        return reply.status(404).send({ error: result.error })
      }

      return result.context
    }
  )

  app.post(
    "/me/delete",
    {
      preHandler: [app.verifySession],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 hour",
          keyGenerator: (request) => request.user?.id ?? request.ip,
        },
      },
      schema: {
        tags: ["Users"],
        summary: "Schedule permanent deletion of the current user account",
        body: deleteAccountBodySchema,
        response: {
          200: scheduleAccountDeletionResponseSchema,
          400: deleteAccountErrorSchema,
          404: deleteAccountErrorSchema,
          409: deleteAccountErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await usersService.scheduleAccountDeletion({
        userId: request.user!.id,
        email: request.body.email,
        confirmedWorkspaceNames: request.body.confirmedWorkspaceNames,
        reason: request.body.reason,
      })

      if (!result.ok) {
        if (result.error === "USER_NOT_FOUND") {
          return reply.status(404).send({ error: result.error })
        }
        if (result.error === "ALREADY_SCHEDULED") {
          return reply.status(409).send({
            error: result.error,
            scheduledDeletionAt: result.scheduledDeletionAt,
          })
        }
        if (result.error === "EMAIL_MISMATCH") {
          return reply.status(400).send({ error: result.error })
        }
        if (result.error === "WORKSPACE_NAME_MISMATCH") {
          return reply.status(400).send({
            error: result.error,
            workspaceName: result.workspaceName,
          })
        }
        return reply.status(400).send({ error: "DELETE_ACCOUNT_FAILED" })
      }

      return { scheduledDeletionAt: result.scheduledDeletionAt }
    }
  )

  app.post(
    "/me/delete/cancel",
    {
      preHandler: [app.verifySession],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 hour",
          keyGenerator: (request) => request.user?.id ?? request.ip,
        },
      },
      schema: {
        tags: ["Users"],
        summary: "Cancel a scheduled account deletion",
        body: cancelAccountDeletionBodySchema,
        response: {
          204: z.null(),
          400: deleteAccountErrorSchema,
          404: deleteAccountErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await usersService.cancelAccountDeletion({
        userId: request.user!.id,
        email: request.body.email,
      })

      if (!result.ok) {
        if (result.error === "USER_NOT_FOUND") {
          return reply.status(404).send({ error: result.error })
        }
        if (result.error === "NOT_SCHEDULED") {
          return reply.status(400).send({ error: result.error })
        }
        if (result.error === "EMAIL_MISMATCH") {
          return reply.status(400).send({ error: result.error })
        }
        return reply.status(400).send({ error: "CANCEL_DELETION_FAILED" })
      }

      return reply.status(204).send(null)
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
        imageUrl: usersService.buildAvatarImageUrl(request.user!.id),
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
        summary:
          "Finalize avatar upload and attach the image to the user profile",
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

  app.get(
    "/:userId/avatar",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Users"],
        summary: "Stream a user's avatar from private object storage",
        params: userIdParamsSchema,
      },
    },
    async (request, reply) => {
      const streamed = await streamUserAvatar(request.params.userId)
      if (!streamed) {
        return reply.status(404).send({ error: "AVATAR_NOT_FOUND" })
      }

      reply.header("Content-Type", streamed.contentType)
      reply.header("Cache-Control", "private, max-age=86400")
      if (streamed.etag) {
        reply.header("ETag", streamed.etag)
      }

      return reply.send(streamed.body)
    }
  )
}
