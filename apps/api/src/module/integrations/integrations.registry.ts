import type { IntegrationProvider } from "@workspace/database"
import type { IntegrationProviderId } from "@workspace/types"
import { linearProvider } from "./providers/linear.provider"
import { slackProvider } from "./providers/slack.provider"
import type { IntegrationProviderAdapter } from "./providers/types"

export const integrationProviders = {
  slack: slackProvider,
  linear: linearProvider,
} satisfies Record<IntegrationProviderId, IntegrationProviderAdapter>

export const SUPPORTED_PROVIDER_IDS = Object.keys(
  integrationProviders
) as IntegrationProviderId[]

export function getIntegrationProvider(
  id: IntegrationProviderId
): IntegrationProviderAdapter {
  return integrationProviders[id]
}

export function assertSupportedProvider(
  id: string
): IntegrationProviderId | null {
  return (SUPPORTED_PROVIDER_IDS as readonly string[]).includes(id)
    ? (id as IntegrationProviderId)
    : null
}

export function providerIdFromDb(
  dbProvider: IntegrationProvider
): IntegrationProviderId | null {
  for (const provider of Object.values(integrationProviders)) {
    if (provider.dbProvider === dbProvider) return provider.id
  }
  return null
}
