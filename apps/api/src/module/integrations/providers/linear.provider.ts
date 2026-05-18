import type { Prisma } from "@workspace/database"
import type {
  IntegrationChannel,
  IntegrationDetail,
  LinearIntegrationConfig,
} from "@workspace/types"
import { LinearIntegrationConfigSchema } from "@workspace/types"
import { z } from "zod"
import {
  defaultLinearConfig,
  exchangeLinearCode,
  listLinearTeams,
} from "../integrations.linear"
import { integrationsRepo } from "../integrations.repo"
import type {
  DetailContext,
  IntegrationProviderAdapter,
  OAuthExchangeResult,
} from "./types"

export const linearSettingsPatchSchema = z
  .object({
    autoCreateIssues: z.boolean(),
    autoAssignParticipants: z.boolean(),
    autoSetDueDate: z.boolean(),
    defaultPriority: z.enum(["urgent", "medium", "low"]),
    defaultTeamId: z.string().nullable(),
    defaultTeamName: z.string().nullable(),
    defaultProjectId: z.string().nullable(),
  })
  .partial()
  .strict()

function parseConfig(raw: unknown): LinearIntegrationConfig {
  return LinearIntegrationConfigSchema.parse({
    ...defaultLinearConfig(),
    ...(typeof raw === "object" && raw !== null ? raw : {}),
  })
}

export const linearProvider: IntegrationProviderAdapter = {
  id: "linear",
  dbProvider: "LINEAR",
  settingsPatchSchema: linearSettingsPatchSchema,

  getAuthorizeUrl({ redirectUri, state }) {
    const clientId = process.env.LINEAR_CLIENT_ID
    if (!clientId) return { ok: false, error: "LINEAR_NOT_CONFIGURED" }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "read,write,issues:create",
      state,
    })
    return { ok: true, url: `https://linear.app/oauth/authorize?${params}` }
  },

  async exchangeCode(code, redirectUri): Promise<OAuthExchangeResult> {
    const tokens = await exchangeLinearCode(code, redirectUri)
    const config = LinearIntegrationConfigSchema.parse({
      ...defaultLinearConfig(),
      defaultTeamId: tokens.defaultTeamId,
      defaultTeamName: tokens.defaultTeamName,
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      externalAccountId: tokens.externalAccountId,
      externalAccountName: tokens.externalAccountName,
      config,
    }
  },

  parseConfig,

  applySettingsPatch(config, patch) {
    return LinearIntegrationConfigSchema.parse({
      ...parseConfig(config),
      ...linearSettingsPatchSchema.parse(patch),
    }) as Prisma.InputJsonValue
  },

  async buildDetailExtras(ctx: DetailContext): Promise<Partial<IntegrationDetail>> {
    const linearConfig = parseConfig(ctx.connection?.config ?? {})

    if (!ctx.connected) {
      return { linearConfig }
    }

    const [issuesCreated, autoAssigned, meetingRows] =
      await integrationsRepo.countActivityStats(ctx.workspaceId, "LINEAR")

    return {
      linearConfig,
      stats: {
        issuesCreated,
        autoAssigned,
        meetingsConnected: meetingRows.length,
      },
    }
  },

  async listDestinations(accessToken): Promise<IntegrationChannel[]> {
    return listLinearTeams(accessToken)
  },
}
