import type { IntegrationProvider } from "@workspace/database"
import type {
  IntegrationChannel,
  IntegrationDetail,
  IntegrationProviderId,
} from "@workspace/types"
import type { Prisma } from "@workspace/database"
import type { z } from "zod"

export type IntegrationConnection = {
  accessToken: string | null
  refreshToken: string | null
  connectedAt: Date | null
  config: unknown
  externalAccountId: string | null
  externalAccountName: string | null
}

export type OAuthExchangeResult = {
  accessToken: string
  refreshToken?: string | null
  externalAccountId: string | null
  externalAccountName: string | null
  config: Prisma.InputJsonValue
}

export type DetailContext = {
  workspaceId: string
  connected: boolean
  connection: IntegrationConnection | null
}

export type SetDestinationInput = {
  workspaceId: string
  connection: IntegrationConnection & { accessToken: string }
  destinationId: string
  destinationName: string
}

export interface IntegrationProviderAdapter {
  readonly id: IntegrationProviderId
  readonly dbProvider: IntegrationProvider
  readonly settingsPatchSchema: z.ZodType

  getAuthorizeUrl(input: {
    redirectUri: string
    state: string
  }): { ok: true; url: string } | { ok: false; error: string }

  exchangeCode(code: string, redirectUri: string): Promise<OAuthExchangeResult>

  parseConfig(raw: unknown): Record<string, unknown>

  applySettingsPatch(
    config: unknown,
    patch: unknown
  ): Prisma.InputJsonValue

  buildDetailExtras(ctx: DetailContext): Promise<Partial<IntegrationDetail>>

  listDestinations?(accessToken: string): Promise<IntegrationChannel[]>

  setDefaultDestination?(
    input: SetDestinationInput
  ): Promise<{ ok: true; config: Prisma.InputJsonValue } | { ok: false }>
}
