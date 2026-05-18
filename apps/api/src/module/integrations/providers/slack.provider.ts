import type { Prisma } from "@workspace/database"
import type {
  IntegrationChannel,
  IntegrationDetail,
  SlackIntegrationConfig,
} from "@workspace/types"
import { SlackIntegrationConfigSchema } from "@workspace/types"
import { z } from "zod"
import {
  defaultSlackConfig,
  exchangeSlackCode,
  joinSlackPublicChannel,
  listSlackChannels,
} from "../integrations.slack"
import type {
  DetailContext,
  IntegrationProviderAdapter,
  OAuthExchangeResult,
  SetDestinationInput,
} from "./types"

export const slackSettingsPatchSchema = z
  .object({
    defaultChannelId: z.string().nullable(),
    defaultChannelName: z.string().nullable(),
    autoPostSummaries: z.boolean(),
    tagActionItemOwners: z.boolean(),
    sendDmToOrganizer: z.boolean(),
    includeTranscriptLink: z.boolean(),
    channelAccessOk: z.boolean(),
  })
  .partial()
  .strict()

function parseConfig(raw: unknown): SlackIntegrationConfig {
  return SlackIntegrationConfigSchema.parse({
    ...defaultSlackConfig(),
    ...(typeof raw === "object" && raw !== null ? raw : {}),
  })
}

export const slackProvider: IntegrationProviderAdapter = {
  id: "slack",
  dbProvider: "SLACK",
  settingsPatchSchema: slackSettingsPatchSchema,

  getAuthorizeUrl({ redirectUri, state }) {
    const clientId = process.env.SLACK_CLIENT_ID
    if (!clientId) return { ok: false, error: "SLACK_NOT_CONFIGURED" }

    const params = new URLSearchParams({
      client_id: clientId,
      scope: [
        "channels:read",
        "channels:join",
        "groups:read",
        "chat:write",
        "incoming-webhook",
      ].join(","),
      redirect_uri: redirectUri,
      state,
    })
    return { ok: true, url: `https://slack.com/oauth/v2/authorize?${params}` }
  },

  async exchangeCode(code, redirectUri): Promise<OAuthExchangeResult> {
    const tokens = await exchangeSlackCode(code, redirectUri)
    let channelAccessOk = true
    if (tokens.defaultChannelId) {
      channelAccessOk = await joinSlackPublicChannel(
        tokens.accessToken,
        tokens.defaultChannelId
      ).catch(() => false)
    }

    const config = SlackIntegrationConfigSchema.parse({
      ...defaultSlackConfig(),
      defaultChannelId: tokens.defaultChannelId,
      defaultChannelName: tokens.defaultChannelName,
      channelAccessOk,
    })

    return {
      accessToken: tokens.accessToken,
      externalAccountId: tokens.externalAccountId,
      externalAccountName: tokens.externalAccountName,
      config,
    }
  },

  parseConfig,

  applySettingsPatch(config, patch) {
    return SlackIntegrationConfigSchema.parse({
      ...parseConfig(config),
      ...slackSettingsPatchSchema.parse(patch),
    }) as Prisma.InputJsonValue
  },

  async buildDetailExtras(ctx): Promise<Partial<IntegrationDetail>> {
    const slackConfig = parseConfig(ctx.connection?.config ?? {})
    let channelAccessOk = slackConfig.channelAccessOk

    if (
      ctx.connected &&
      ctx.connection?.accessToken &&
      slackConfig.defaultChannelId
    ) {
      channelAccessOk = await joinSlackPublicChannel(
        ctx.connection.accessToken,
        slackConfig.defaultChannelId
      ).catch(() => false)
    }

    return {
      slackConfig: { ...slackConfig, channelAccessOk },
      channelAccessOk,
    }
  },

  async listDestinations(accessToken): Promise<IntegrationChannel[]> {
    return listSlackChannels(accessToken)
  },

  async setDefaultDestination(input: SetDestinationInput) {
    const channelAccessOk = await joinSlackPublicChannel(
      input.connection.accessToken,
      input.destinationId
    ).catch(() => false)

    const config = SlackIntegrationConfigSchema.parse({
      ...parseConfig(input.connection.config),
      defaultChannelId: input.destinationId,
      defaultChannelName: input.destinationName,
      channelAccessOk,
    })

    return { ok: true as const, config }
  },
}
