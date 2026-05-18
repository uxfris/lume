import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import * as workspacesService from "./workspaces.service"
import {
  acceptInvitationResponseSchema,
  createInvitationBodySchema,
  createInvitationResponseSchema,
  createWorkspaceBodySchema,
  errorResponseSchema,
  invitationTokenParamsSchema,
  listWorkspaceInvitationsResponseSchema,
  listWorkspacePeopleResponseSchema,
  listWorkspacesResponseSchema,
  noContentResponseSchema,
  memberParamsSchema,
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
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
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
      return reply.status(201).send({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      })
    }
  )

  app.get(
    "/:id/people",
    {
      preHandler: [app.verifySession, app.requireWorkspaceFromParams],
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
      preHandler: [app.verifySession, app.requireWorkspaceFromParams],
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
        summary: "Update workspace name",
        params: workspaceParamsSchema,
        body: updateWorkspaceBodySchema,
        response: {
          200: workspaceSummarySchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await workspacesService.updateWorkspaceName(
        request.params.id,
        request.user!.id,
        request.body.name
      )

      if (!result.ok) {
        if (result.error === "NOT_FOUND") {
          return reply.status(404).send({ error: "WORKSPACE_NOT_FOUND" })
        }
        return reply.status(403).send({ error: "FORBIDDEN" })
      }

      return reply.status(200).send({
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug,
      })
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
                : 409

        return reply.status(status).send({ error: result.error })
      }

      return reply.status(201).send({
        invitationId: result.invitationId,
        token: result.token,
        expiresAt: result.expiresAt.toISOString(),
      })
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
            : result.error === "FORBIDDEN"
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
