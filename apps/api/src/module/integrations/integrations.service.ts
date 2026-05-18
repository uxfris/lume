import type {
  Integration,
  IntegrationDetail,
  IntegrationProviderId,
} from "@workspace/types"
import {
  catalogEntryFor,
  INTEGRATION_CATALOG,
} from "./integrations.catalog"
import {
  assertSupportedProvider,
  getIntegrationProvider,
  providerIdFromDb,
} from "./integrations.registry"
import { integrationsRepo } from "./integrations.repo"
import { presentActivities } from "./integrations.presenter"
import {
  createOAuthState,
  integrationOAuthRedirectUri,
  parseOAuthState,
} from "./integrations.oauth"
import type { IntegrationConnection } from "./providers/types"
import { env } from "../../config/env"

export { assertSupportedProvider }

function isConnected(row: IntegrationConnection) {
  return Boolean(row.accessToken && row.connectedAt)
}

function toConnection(
  row: Awaited<ReturnType<typeof integrationsRepo.findOne>>
): IntegrationConnection | null {
  if (!row) return null
  return {
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    connectedAt: row.connectedAt,
    config: row.config,
    externalAccountId: row.externalAccountId,
    externalAccountName: row.externalAccountName,
  }
}

export async function listIntegrations(
  workspaceId: string
): Promise<Integration[]> {
  const connections = await integrationsRepo.findByWorkspace(workspaceId)
  const connectedIds = new Set(
    connections
      .filter((c) => isConnected(c))
      .map((c) => providerIdFromDb(c.provider))
      .filter((id): id is IntegrationProviderId => id !== null)
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

  const provider = getIntegrationProvider(providerId)
  const row = await integrationsRepo.findOne(workspaceId, provider.dbProvider)
  const connection = toConnection(row)
  const connected = Boolean(connection && isConnected(connection))

  const base: IntegrationDetail = {
    id: providerId,
    name: catalog.name,
    description: catalog.description,
    logo: catalog.logo,
    status: connected ? "connected" : "disconnected",
    connectedAccountLabel: connected
      ? (connection!.externalAccountName ??
        connection!.externalAccountId ??
        "Connected")
      : null,
  }

  const extras = await provider.buildDetailExtras({
    workspaceId,
    connected,
    connection,
  })

  return { ...base, ...extras }
}

export async function listIntegrationActivity(
  workspaceId: string,
  providerId: IntegrationProviderId
) {
  const provider = getIntegrationProvider(providerId)
  const rows = await integrationsRepo.listActivity({
    workspaceId,
    provider: provider.dbProvider,
    limit: 20,
  })
  return { activities: presentActivities(rows) }
}

export function getOAuthAuthorizeUrl(input: {
  workspaceId: string
  userId: string
  provider: IntegrationProviderId
}): { ok: true; url: string } | { ok: false; error: string } {
  const provider = getIntegrationProvider(input.provider)
  const state = createOAuthState(input)
  return provider.getAuthorizeUrl({
    redirectUri: integrationOAuthRedirectUri(),
    state,
  })
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

  const provider = getIntegrationProvider(parsed.provider)
  const redirectUri = integrationOAuthRedirectUri()

  try {
    const result = await provider.exchangeCode(input.code, redirectUri)

    await integrationsRepo.upsertConnection({
      workspaceId: parsed.workspaceId,
      provider: provider.dbProvider,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      externalAccountId: result.externalAccountId,
      externalAccountName: result.externalAccountName,
      connectedByUserId: parsed.userId,
      config: result.config,
    })

    return {
      ok: true,
      provider: parsed.provider,
      workspaceId: parsed.workspaceId,
    }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function disconnectIntegration(
  workspaceId: string,
  providerId: IntegrationProviderId
) {
  const provider = getIntegrationProvider(providerId)
  const row = await integrationsRepo.findOne(workspaceId, provider.dbProvider)
  if (!row || !isConnected(row)) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }
  await integrationsRepo.disconnect(workspaceId, provider.dbProvider)
  return { ok: true as const }
}

export async function patchIntegrationSettings(
  workspaceId: string,
  providerId: IntegrationProviderId,
  patch: unknown
) {
  const provider = getIntegrationProvider(providerId)
  const row = await integrationsRepo.findOne(workspaceId, provider.dbProvider)
  if (!row || !isConnected(row)) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }

  const next = provider.applySettingsPatch(row.config, patch)
  await integrationsRepo.updateConfig(workspaceId, provider.dbProvider, next)
  return { ok: true as const }
}

export async function setIntegrationDestination(
  workspaceId: string,
  providerId: IntegrationProviderId,
  destinationId: string,
  destinationName: string
) {
  const provider = getIntegrationProvider(providerId)
  if (!provider.setDefaultDestination) {
    return { ok: false as const, error: "NOT_SUPPORTED" }
  }

  const row = await integrationsRepo.findOne(workspaceId, provider.dbProvider)
  if (!row || !isConnected(row) || !row.accessToken) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }

  const result = await provider.setDefaultDestination({
    workspaceId,
    connection: { ...row, accessToken: row.accessToken },
    destinationId,
    destinationName,
  })

  if (!result.ok) {
    return { ok: false as const, error: "SET_DESTINATION_FAILED" }
  }

  await integrationsRepo.updateConfig(
    workspaceId,
    provider.dbProvider,
    result.config
  )
  return { ok: true as const }
}

export async function listProviderChannels(
  workspaceId: string,
  providerId: IntegrationProviderId
) {
  const provider = getIntegrationProvider(providerId)
  if (!provider.listDestinations) {
    return { ok: false as const, error: "NOT_SUPPORTED" }
  }

  const row = await integrationsRepo.findOne(workspaceId, provider.dbProvider)
  if (!row || !isConnected(row) || !row.accessToken) {
    return { ok: false as const, error: "NOT_CONNECTED" }
  }

  const channels = await provider.listDestinations(row.accessToken)
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
