import { z } from "zod"
import {
  IntegrationProviderIdSchema,
  IntegrationSchema,
  IntegrationDetailSchema,
  IntegrationRecentActivitySchema,
  IntegrationChannelSchema,
} from "@workspace/types"
import { linearSettingsPatchSchema } from "./providers/linear.provider"
import { slackSettingsPatchSchema } from "./providers/slack.provider"

export const integrationProviderParamsSchema = z.object({
  provider: IntegrationProviderIdSchema,
})

export const listIntegrationsResponseSchema = z.object({
  integrations: z.array(IntegrationSchema),
})

export const integrationDetailResponseSchema = IntegrationDetailSchema

export const integrationActivityResponseSchema = z.object({
  activities: z.array(IntegrationRecentActivitySchema),
})

export const integrationChannelsResponseSchema = z.object({
  channels: z.array(IntegrationChannelSchema),
})

export const oauthUrlResponseSchema = z.object({
  url: z.string().url(),
})

export const patchSlackSettingsBodySchema = slackSettingsPatchSchema
export const patchLinearSettingsBodySchema = linearSettingsPatchSchema

export const patchSlackChannelBodySchema = z.object({
  channelId: z.string().min(1),
  channelName: z.string().min(1),
})

export const integrationErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})
