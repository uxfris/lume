import type { IntegrationProvider } from "@workspace/database"
import type {
  Integration,
  IntegrationDetail,
  IntegrationProviderId,
  LinearIntegrationConfig,
  SlackIntegrationConfig,
} from "@workspace/types"
import {
  LinearIntegrationConfigSchema,
  SlackIntegrationConfigSchema,
} from "@workspace/types"
import {
  catalogEntryFor,
  INTEGRATION_CATALOG,
  isSupportedProvider,
} from "./integrations.catalog"
import { integrationsRepo } from "./integrations.repo"
import { presentActivities } from "./integrations.presenter"
import {
  createOAuthState,
  integrationOAuthRedirectUri,
  parseOAuthState,
} from "./integrations.oauth"
import {
  defaultSlackConfig,
  exchangeSlackCode,
  joinSlackPublicChannel,
  listSlackChannels,
  verifySlackChannelAccess,
} from "./integrations.slack"
import {
  defaultLinearConfig,
  exchangeLinearCode,
  listLinearTeams,
} from "./integrations.linear"
import { env } from "../../config/env"

function providerToDb(id: IntegrationProviderId): IntegrationProvider {
  return id === "slack" ? "SLACK" : "LINEAR"
}

function providerFromDb(provider: IntegrationProvider): IntegrationProviderId {
  return provider === "SLACK" ? "slack" : "linear"
}

function parseSlackConfig(raw: unknown): SlackIntegrationConfig {
  return SlackIntegrationConfigSchema.parse({
    ...defaultSlackConfig(),
    ...(typeof raw === "object" && raw !== null ? raw : {}),
  })
}

function parseLinearConfig(raw: unknown): LinearIntegrationConfig {
  return LinearIntegrationConfigSchema.parse({
    ...defaultLinearConfig(),
    ...(typeof raw === "object" && raw !== null ? raw : {}),
  })
}

function isConnected(row: {
  accessToken: string | null
  connectedAt: Date | null
}) {
  return Boolean(row.accessToken && row.connectedAt)
}

export async function listIntegrations(
  workspaceId: string
): Promise<Integration[]> {
  const connections = await integrationsRepo.findByWorkspace(workspaceId)
  const connectedIds = new Set(
    connections
      .filter((c) => isConnected(c))
      .map((c) => providerFromDb(c.provider))
  )

  return INTEGRATION_CATALOG.map((entry) => {
    if (entry.status === "coming soon") return entry
    return {
      ...entry,
      status: connectedIds.has(entry.id as IntegrationProviderId)
        ? ("connected" as const)
        : ("disconnected" as const),
    }
  })
}

export async function getIntegrationDetail(
  workspaceId: string,
  providerId: IntegrationProviderId
): Promise<IntegrationDetail | null> {
  const catalog = catalogEntryFor(providerId)
  if (!catalog || catalog.status === "coming soon") return null

  const row = await integrationsRepo.findOne(
    workspaceId,
    providerToDb(providerId)
  )
  const connected = row && isConnected(row)

  const base: IntegrationDetail = {
    id: providerId,
    name: catalog.name,
    description: catalog.description,
    logo: catalog.logo,
    status: connected ? "connected" : "disconnected",
    connectedAccountLabel: connected
      ? (row!.externalAccountName ?? row!.externalAccountId ?? "Connected")
      : null,
  }

  if (providerId === "slack") {
    const slackConfig = parseSlackConfig(row?.config ?? {})
    let channelAccessOk = slackConfig.channelAccessOk
    if (connected && row?.accessToken && slackConfig.defaultChannelId) {
      channelAccessOk = await verifySlackChannelAccess(
        row.accessToken,
        slackConfig.defaultChannelId
      ).catch(() => false)
    }
    return {
      ...base,
      slackConfig: { ...slackConfig, channelAccessOk },
      channelAccessOk,
    }
  }

  if (providerId === "linear") {
    const linearConfig = parseLinearConfig(row?.config ?? {})
    const [issuesCreated, autoAssigned, meetingRows] = connected
      ? await integrationsRepo.countActivityStats(workspaceId, "LINEAR")
      : [0, 0, [] as Array<{ meetingId: string | null }>]

    return {
      ...base,
      linearConfig,
      stats: {
        issuesCreated,
        autoAssigned,
        meetingsConnected: meetingRows.length,
      },
    }
  }

  return base
}

export async function listIntegrationActivity(
  workspaceId: string,
  providerId: IntegrationProviderId
) {
  const rows = await integrationsRepo.listActivity({
    workspaceId,
    provider: providerToDb(providerId),
    limit: 20,
  })
  return { activities: presentActivities(rows) }
}

export function getOAuthAuthorizeUrl(input: {
  workspaceId: string
  userId: string
  provider: IntegrationProviderId
}): { ok: true; url: string } | { ok: false; error: string } {
  const redirectUri = integrationOAuthRedirectUri()
  const state = createOAuthState(input)

  if (input.provider === "slack") {
    const clientId = process.env.SLACK_CLIENT_ID
    if (!clientId) return { ok: false, error: "SLACK_NOT_CONFIGURED" }

    const scopes = [
      "channels:read",
      "channels:join",
      "groups:read",
      "chat:write",
      "incoming-webhook",
    ].join(",")

    const params = new URLSearchParams({
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state,
    })
    return { ok: true, url: `https://slack.com/oauth/v2/authorize?${params}` }
  }

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
}

export async function completeOAuthCallback(input: {
  code: string
  state: string
}): Promise<
  | { ok: true; provider: IntegrationProviderId; workspaceId: string }
  | { ok: false; error: string }
> {
  const parsed = parseOAuthState(input.state)
  if (!parsed) return { ok: false, error: "INVALID_STATE" }

  const redirectUri = integrationOAuthRedirectUri()

  try {
    if (parsed.provider === "slack") {
      const tokens = await exchangeSlackCode(input.code, redirectUri)
      let channelAccessOk = true
      if (tokens.defaultChannelId) {
        channelAccessOk = await joinSlackPublicChannel(
          tokens.accessToken,
          tokens.defaultChannelId
        ).catch(() => false)
      }

      const config = {
        ...defaultSlackConfig(),
        defaultChannelId: tokens.defaultChannelId,
        defaultChannelName: tokens.defaultChannelName,
        channelAccessOk,
      }

      await integrationsRepo.upsertConnection({
        workspaceId: parsed.workspaceId,
        provider: "SLACK",
        accessToken: tokens.accessToken,
        externalAccountId: tokens.externalAccountId,
        externalAccountName: tokens.externalAccountName,
        connectedByUserId: parsed.userId,
        config,
      })
    } else {
      const tokens = await exchangeLinearCode(input.code, redirectUri)
      const config = {
        ...defaultLinearConfig(),
        defaultTeamId: tokens.defaultTeamId,
        defaultTeamName: tokens.defaultTeamName,
      }

      await integrationsRepo.upsertConnection({
        workspaceId: parsed.workspaceId,
        provider: "LINEAR",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        externalAccountId: tokens.externalAccountId,
        externalAccountName: tokens.externalAccountName,
        connectedByUserId: parsed.userId,
        config,
      })
    }

    return {
      ok: true,
      provider: parsed.provider,
      workspaceId: parsed.workspaceId,
    }
  } catch (err) {
    const message = (err as Error).message
    return { ok: false, error: message }
  }
}

export async function disconnectIntegration(
  workspaceId: string,
  providerId: IntegrationProviderId
) {
  const row = await integrationsRepo.findOne(
    workspaceId,
    providerToDb(providerId)
  )
  if (!row || !isConnected(row)) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }
  await integrationsRepo.disconnect(workspaceId, providerToDb(providerId))
  return { ok: true as const }
}

export async function patchSlackSettings(
  workspaceId: string,
  patch: Partial<SlackIntegrationConfig>
) {
  const row = await integrationsRepo.findOne(workspaceId, "SLACK")
  if (!row || !isConnected(row)) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }

  const next = SlackIntegrationConfigSchema.parse({
    ...parseSlackConfig(row.config),
    ...patch,
  })

  await integrationsRepo.updateConfig(workspaceId, "SLACK", next)
  return { ok: true as const }
}

export async function patchLinearSettings(
  workspaceId: string,
  patch: Partial<LinearIntegrationConfig>
) {
  const row = await integrationsRepo.findOne(workspaceId, "LINEAR")
  if (!row || !isConnected(row)) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }

  const next = LinearIntegrationConfigSchema.parse({
    ...parseLinearConfig(row.config),
    ...patch,
  })

  await integrationsRepo.updateConfig(workspaceId, "LINEAR", next)
  return { ok: true as const }
}

export async function setSlackChannel(
  workspaceId: string,
  channelId: string,
  channelName: string
) {
  const row = await integrationsRepo.findOne(workspaceId, "SLACK")
  if (!row || !isConnected(row) || !row.accessToken) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }

  const channelAccessOk = await joinSlackPublicChannel(
    row.accessToken,
    channelId
  ).catch(() => false)

  const next = SlackIntegrationConfigSchema.parse({
    ...parseSlackConfig(row.config),
    defaultChannelId: channelId,
    defaultChannelName: channelName,
    channelAccessOk,
  })

  await integrationsRepo.updateConfig(workspaceId, "SLACK", next)
  return { ok: true as const, channelAccessOk }
}

export async function listProviderChannels(
  workspaceId: string,
  providerId: IntegrationProviderId
) {
  const row = await integrationsRepo.findOne(
    workspaceId,
    providerToDb(providerId)
  )
  if (!row || !isConnected(row) || !row.accessToken) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }

  if (providerId === "slack") {
    const channels = await listSlackChannels(row.accessToken)
    return { ok: true as const, channels }
  }

  const channels = await listLinearTeams(row.accessToken)
  return { ok: true as const, channels }
}

export function oauthCallbackRedirectUrl(
  provider: IntegrationProviderId,
  result: "success" | "error",
  error?: string
) {
  const base = `${env.FRONTEND_URL.replace(/\/$/, "")}/dashboard/integrations/${provider}`
  const params = new URLSearchParams({ oauth: result })
  if (error) params.set("error", error)
  return `${base}?${params}`
}

export function assertSupportedProvider(
  id: string
): IntegrationProviderId | null {
  return isSupportedProvider(id) ? id : null
}
