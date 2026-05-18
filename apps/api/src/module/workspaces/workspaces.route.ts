import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { toAbsoluteFrontendUrl } from "../../lib/app-url"
import { streamWorkspaceAvatar } from "../../lib/workspace-avatar"
import * as workspacesService from "./workspaces.service"
import { toWorkspaceSummary } from "./workspaces.presenter"
import {
  acceptInvitationResponseSchema,
  avatarErrorSchema,
  completeWorkspaceAvatarResponseSchema,
  createInvitationBodySchema,
  createInvitationResponseSchema,
  createWorkspaceBodySchema,
  errorResponseSchema,
  invitationTokenParamsSchema,
  listWorkspaceInvitationsResponseSchema,
  listWorkspacePeopleResponseSchema,
  listWorkspacesResponseSchema,
  noContentResponseSchema,
  createInviteLinkBodySchema,
  inviteLinkGetResponseSchema,
  inviteLinkResponseSchema,
  memberParamsSchema,
  presignWorkspaceAvatarBodySchema,
  presignWorkspaceAvatarResponseSchema,
  revokeInvitationParamsSchema,
  updateMemberRoleBodySchema,
  updateWorkspaceBodySchema,
  workspaceParamsSchema,
  workspaceSummarySchema,
} from "./workspaces.schema"

export const workspacesRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Workspaces"],
        summary: "List workspaces the current user belongs to",
        response: {
          200: listWorkspacesResponseSchema,
        },
      },
    },
    async (request) => {
      const rows = await workspacesService.listWorkspacesForUser({
        id: request.user!.id,
        name: request.user!.name,
        email: request.user!.email,
      })

      return {
        workspaces: rows.map((m) => ({
          ...toWorkspaceSummary(m.workspace),
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        })),
      }
    }
  )

  app.post(
    "/",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Workspaces"],
        summary: "Create a new workspace",
        body: createWorkspaceBodySchema,
        response: {
          201: workspaceSummarySchema,
        },
      },
    },
    async (request, reply) => {
      const workspace = await workspacesService.createWorkspace(
        request.user!.id,
        request.body.name
      )
      return reply.status(201).send(toWorkspaceSummary(workspace))
    }
  )

  app.get(
    "/:id/people",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "List all people in the workspace",
        params: workspaceParamsSchema,
        response: {
          200: listWorkspacePeopleResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const people = await workspacesService.listWorkspacePeople(
        request.params.id,
        request.user!.id
      )
      return { people }
    }
  )

  app.get(
    "/:id/invitations",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "",
        params: workspaceParamsSchema,
        response: {
          200: listWorkspaceInvitationsResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const invitations = await workspacesService.listWorkspaceInvitations(
        request.params.id
      )
      return { invitations }
    }
  )

  app.patch(
    "/:id",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Update workspace name or handle",
        params: workspaceParamsSchema,
        body: updateWorkspaceBodySchema,
        response: {
          200: workspaceSummarySchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.updateWorkspace(
        request.params.id,
        request.user!.id,
        request.body
      )

      if (!result.ok) {
        if (result.error === "NOT_FOUND") {
          return reply.status(404).send({ error: "WORKSPACE_NOT_FOUND" })
        }
        if (result.error === "FORBIDDEN") {
          return reply.status(403).send({ error: "FORBIDDEN" })
        }
        if (result.error === "SLUG_TAKEN") {
          return reply.status(409).send({ error: "SLUG_TAKEN" })
        }
        return reply.status(400).send({ error: "INVALID_SLUG" })
      }

      return reply.status(200).send(result.workspace)
    }
  )

  app.post(
    "/:id/avatar/presign",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
          keyGenerator: (request) => {
            const params = request.params as { id: string }
            return `${request.user?.id ?? request.ip}:${params.id}`
          },
        },
      },
      schema: {
        tags: ["Workspaces"],
        summary: "Create a presigned S3 URL for a workspace avatar",
        params: workspaceParamsSchema,
        body: presignWorkspaceAvatarBodySchema,
        response: {
          201: presignWorkspaceAvatarResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.presignWorkspaceAvatar({
        workspaceId: request.params.id,
        userId: request.user!.id,
        contentType: request.body.contentType,
      })

      if (!result.ok) {
        if (result.error === "NOT_FOUND") {
          return reply.status(404).send({ error: "WORKSPACE_NOT_FOUND" })
        }
        return reply.status(403).send({ error: "FORBIDDEN" })
      }

      return reply.status(201).send({
        uploadUrl: result.url,
        imageUrl: toAbsoluteFrontendUrl(
          workspacesService.buildWorkspaceAvatarImageUrl(request.params.id)
        ),
        expiresInSeconds: result.expiresInSeconds,
      })
    }
  )

  app.post(
    "/:id/avatar/complete",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Finalize workspace avatar upload",
        params: workspaceParamsSchema,
        response: {
          200: completeWorkspaceAvatarResponseSchema,
          400: avatarErrorSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          422: avatarErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.completeWorkspaceAvatar({
        workspaceId: request.params.id,
        userId: request.user!.id,
      })

      if (!result.ok) {
        if (result.error === "NOT_FOUND") {
          return reply.status(404).send({ error: "WORKSPACE_NOT_FOUND" })
        }
        if (result.error === "FORBIDDEN") {
          return reply.status(403).send({ error: "FORBIDDEN" })
        }
        if (result.error === "OBJECT_NOT_IN_S3") {
          return reply.status(422).send({ error: "OBJECT_NOT_IN_S3" })
        }
        if (result.error === "FILE_TOO_LARGE") {
          return reply.status(400).send({ error: "FILE_TOO_LARGE" })
        }
        return reply.status(400).send({ error: "INVALID_CONTENT_TYPE" })
      }

      return reply.status(200).send(result.workspace)
    }
  )

  app.get(
    "/:id/avatar",
    {
      preHandler: [app.verifySession, app.requireWorkspaceFromParams],
      schema: {
        tags: ["Workspaces"],
        summary: "Stream a workspace avatar from private object storage",
        params: workspaceParamsSchema,
      },
    },
    async (request, reply) => {
      const streamed = await streamWorkspaceAvatar(request.params.id)
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

  app.post(
    "/:id/invitations",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Create or refresh a workspace invitation",
        params: workspaceParamsSchema,
        body: createInvitationBodySchema,
        response: {
          201: createInvitationResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.createOrRefreshInvitation(
        request.params.id,
        request.user!.id,
        request.user!.email,
        request.user!.name,
        request.body.email,
        request.body.role
      )

      if (!result.ok) {
        const status =
          result.error === "NOT_FOUND"
            ? 404
            : result.error === "FORBIDDEN"
              ? 403
              : result.error === "SELF_INVITE"
                ? 400
                : result.error === "PRO_PLAN_REQUIRED"
                  ? 409
                  : 409

        return reply.status(status).send({ error: result.error })
      }

      return reply.status(201).send({
        invitationId: result.invitationId,
        token: result.token,
        expiresAt: result.expiresAt.toISOString(),
        emailSent: result.emailSent,
      })
    }
  )

  app.get(
    "/:id/invite-link",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Get active workspace invite link metadata",
        params: workspaceParamsSchema,
        response: {
          200: inviteLinkGetResponseSchema,
        },
      },
    },
    async (request) => {
      const link = await workspacesService.getWorkspaceInviteLink(
        request.params.id
      )
      return { link }
    }
  )

  app.post(
    "/:id/invite-link",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Create or refresh workspace invite link",
        params: workspaceParamsSchema,
        body: createInviteLinkBodySchema,
        response: {
          201: inviteLinkResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.createOrRegenerateInviteLink(
        request.params.id,
        request.user!.id,
        request.body.role
      )

      if (!result.ok) {
        const status =
          result.error === "NOT_FOUND"
            ? 404
            : result.error === "FORBIDDEN"
              ? 403
              : 409
        return reply.status(status).send({ error: result.error })
      }

      return reply.status(201).send({
        url: result.url,
        expiresAt: result.expiresAt.toISOString(),
        role: result.role,
      })
    }
  )

  app.post(
    "/:id/invite-link/regenerate",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Regenerate workspace invite link",
        params: workspaceParamsSchema,
        body: createInviteLinkBodySchema,
        response: {
          201: inviteLinkResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.createOrRegenerateInviteLink(
        request.params.id,
        request.user!.id,
        request.body.role
      )

      if (!result.ok) {
        const status =
          result.error === "NOT_FOUND"
            ? 404
            : result.error === "FORBIDDEN"
              ? 403
              : 409
        return reply.status(status).send({ error: result.error })
      }

      return reply.status(201).send({
        url: result.url,
        expiresAt: result.expiresAt.toISOString(),
        role: result.role,
      })
    }
  )

  app.delete(
    "/:id/invite-link",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Revoke workspace invite link",
        params: workspaceParamsSchema,
        response: {
          204: noContentResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.revokeWorkspaceInviteLink(
        request.params.id,
        request.user!.id
      )

      if (!result.ok) {
        const status = result.error === "NOT_FOUND" ? 404 : 403
        return reply.status(status).send({ error: result.error })
      }

      return reply.status(204).send(null)
    }
  )

  app.patch(
    "/:id/members/:memberId",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Update a workspace member role",
        params: memberParamsSchema,
        body: updateMemberRoleBodySchema,
        response: {
          204: noContentResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.updateMemberRole(
        request.params.id,
        request.user!.id,
        request.params.memberId,
        request.body.role
      )

      if (!result.ok) {
        const status =
          result.error === "NOT_FOUND" || result.error === "TARGET_NOT_FOUND"
            ? 404
            : result.error === "FORBIDDEN" ||
                result.error === "CANNOT_ASSIGN_OWNER"
              ? 403
              : 409

        return reply.status(status).send({ error: result.error })
      }

      return reply.status(204).send(null)
    }
  )

  app.delete(
    "/:id/members/:memberId",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Remove a workspace member",
        params: memberParamsSchema,
        response: {
          204: noContentResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.removeMember(
        request.params.id,
        request.user!.id,
        request.params.memberId
      )

      if (!result.ok) {
        const status =
          result.error === "NOT_FOUND" || result.error === "TARGET_NOT_FOUND"
            ? 404
            : result.error === "FORBIDDEN"
              ? 403
              : 409

        return reply.status(status).send({ error: result.error })
      }

      return reply.status(204).send(null)
    }
  )

  app.post(
    "/:id/leave",
    {
      preHandler: [app.verifySession, app.requireWorkspaceFromParams],
      schema: {
        tags: ["Workspaces"],
        summary: "Leave the workspace",
        params: workspaceParamsSchema,
        response: {
          204: noContentResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.leaveWorkspace(
        request.params.id,
        request.user!.id
      )

      if (!result.ok) {
        const status =
          result.error === "NOT_FOUND"
            ? 404
            : result.error === "LAST_WORKSPACE" || result.error === "SOLE_OWNER"
              ? 409
              : 403

        return reply.status(status).send({ error: result.error })
      }

      return reply.status(204).send(null)
    }
  )

  app.delete(
    "/:id/invitations/:invitationId",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspaceFromParams,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Workspaces"],
        summary: "Revoke a workspace invitation",
        params: revokeInvitationParamsSchema,
        response: {
          204: noContentResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.revokeInvitation(
        request.params.id,
        request.user!.id,
        request.params.invitationId
      )

      if (!result.ok) {
        const status =
          result.error === "NOT_FOUND" || result.error === "INVITE_NOT_FOUND"
            ? 404
            : result.error === "FORBIDDEN"
              ? 403
              : 409

        return reply.status(status).send({ error: result.error })
      }

      return reply.status(204).send(null)
    }
  )
}

export const invitationsAcceptRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/:token/accept",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Invitations"],
        summary: "Accept a workspace invitation",
        params: invitationTokenParamsSchema,
        response: {
          200: acceptInvitationResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          410: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.acceptInvitation(
        request.user!.id,
        request.user!.email,
        request.params.token
      )

      if (!result.ok) {
        const status =
          result.error === "INVITE_NOT_FOUND"
            ? 404
            : result.error === "EMAIL_MISMATCH"
              ? 403
              : result.error === "INVITE_REVOKED" ||
                  result.error === "INVITE_EXPIRED" ||
                  result.error === "INVITE_ALREADY_USED"
                ? 410
                : 400

        return reply.status(status).send({ error: result.error })
      }

      return reply.status(200).send({
        workspaceId: result.workspaceId,
        role: result.role,
      })
    }
  )
}
