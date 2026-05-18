import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import {
  integrationActivityResponseSchema,
  integrationChannelsResponseSchema,
  integrationDetailResponseSchema,
  integrationErrorSchema,
  integrationProviderParamsSchema,
  listIntegrationsResponseSchema,
  oauthUrlResponseSchema,
  patchLinearSettingsBodySchema,
  patchSlackChannelBodySchema,
  patchSlackSettingsBodySchema,
} from "./integrations.schema"
import * as integrationsService from "./integrations.service"
import { parseOAuthState } from "./integrations.oauth"

export const integrationsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Integrations"],
        summary: "List integrations for the current workspace",
        response: {
          200: listIntegrationsResponseSchema,
        },
      },
    },
    async (request) => {
      const integrations = await integrationsService.listIntegrations(
        request.workspace!.id
      )
      return { integrations }
    }
  )

  app.get(
    "/oauth/callback",
    {
      schema: {
        tags: ["Integrations"],
        summary: "OAuth callback for Slack / Linear",
        querystring: z.object({
          code: z.string().optional(),
          state: z.string().optional(),
          error: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { code, state, error: oauthError } = request.query
      const parsedState = state ? parseOAuthState(state) : null
      const provider = parsedState?.provider ?? "slack"

      if (oauthError || !code || !state) {
        return reply.redirect(
          integrationsService.oauthCallbackRedirectUrl(
            provider,
            "error",
            oauthError ?? "access_denied"
          )
        )
      }

      const result = await integrationsService.completeOAuthCallback({
        code,
        state,
      })
      if (!result.ok) {
        return reply.redirect(
          integrationsService.oauthCallbackRedirectUrl(
            provider,
            "error",
            result.error
          )
        )
      }

      return reply.redirect(
        integrationsService.oauthCallbackRedirectUrl(result.provider, "success")
      )
    }
  )

  app.get(
    "/:provider",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Integrations"],
        summary: "Integration detail",
        params: integrationProviderParamsSchema,
        response: {
          200: integrationDetailResponseSchema,
          404: integrationErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const provider = integrationsService.assertSupportedProvider(
        request.params.provider
      )
      if (!provider) {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }

      const detail = await integrationsService.getIntegrationDetail(
        request.workspace!.id,
        provider
      )
      if (!detail) {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }
      return detail
    }
  )

  app.get(
    "/:provider/activity",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Integrations"],
        summary: "Recent integration activity",
        params: integrationProviderParamsSchema,
        response: {
          200: integrationActivityResponseSchema,
          404: integrationErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const provider = integrationsService.assertSupportedProvider(
        request.params.provider
      )
      if (!provider) {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }
      return integrationsService.listIntegrationActivity(
        request.workspace!.id,
        provider
      )
    }
  )

  app.get(
    "/:provider/oauth-url",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Integrations"],
        summary: "Start OAuth — returns authorize URL",
        params: integrationProviderParamsSchema,
        response: {
          200: oauthUrlResponseSchema,
          404: integrationErrorSchema,
          503: integrationErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const provider = integrationsService.assertSupportedProvider(
        request.params.provider
      )
      if (!provider) {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }

      const result = integrationsService.getOAuthAuthorizeUrl({
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        provider,
      })

      if (!result.ok) {
        return reply.status(503).send({
          error: result.error,
          message: "Integration OAuth is not configured on the server.",
        })
      }

      return { url: result.url }
    }
  )

  app.get(
    "/:provider/channels",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Integrations"],
        summary: "List Slack channels or Linear teams",
        params: integrationProviderParamsSchema,
        response: {
          200: integrationChannelsResponseSchema,
          404: integrationErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const provider = integrationsService.assertSupportedProvider(
        request.params.provider
      )
      if (!provider) {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }

      const result = await integrationsService.listProviderChannels(
        request.workspace!.id,
        provider
      )
      if (!result.ok) {
        return reply.status(404).send({ error: result.error })
      }
      return { channels: result.channels }
    }
  )

  app.delete(
    "/:provider",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Integrations"],
        summary: "Disconnect integration",
        params: integrationProviderParamsSchema,
        response: {
          204: z.undefined(),
          404: integrationErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const provider = integrationsService.assertSupportedProvider(
        request.params.provider
      )
      if (!provider) {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }

      const result = await integrationsService.disconnectIntegration(
        request.workspace!.id,
        provider
      )
      if (!result.ok) {
        return reply.status(404).send({ error: result.error })
      }
      return reply.status(204).send()
    }
  )

  app.patch(
    "/:provider/settings",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Integrations"],
        summary: "Update integration settings",
        params: integrationProviderParamsSchema,
        response: {
          204: z.undefined(),
          404: integrationErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const provider = integrationsService.assertSupportedProvider(
        request.params.provider
      )
      if (!provider) {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }

      const result =
        provider === "slack"
          ? await integrationsService.patchSlackSettings(
              request.workspace!.id,
              patchSlackSettingsBodySchema.parse(request.body)
            )
          : await integrationsService.patchLinearSettings(
              request.workspace!.id,
              patchLinearSettingsBodySchema.parse(request.body)
            )

      if (!result.ok) {
        return reply.status(404).send({ error: result.error })
      }
      return reply.status(204).send()
    }
  )

  app.patch(
    "/:provider/channel",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Integrations"],
        summary: "Set default Slack channel",
        params: integrationProviderParamsSchema,
        body: patchSlackChannelBodySchema,
        response: {
          204: z.undefined(),
          404: integrationErrorSchema,
        },
      },
    },
    async (request, reply) => {
      if (request.params.provider !== "slack") {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }

      const result = await integrationsService.setSlackChannel(
        request.workspace!.id,
        request.body.channelId,
        request.body.channelName
      )
      if (!result.ok) {
        return reply.status(404).send({ error: result.error })
      }
      return reply.status(204).send()
    }
  )
}
