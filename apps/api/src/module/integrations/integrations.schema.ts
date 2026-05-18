import { z } from "zod"
import {
  IntegrationProviderIdSchema,
  IntegrationSchema,
  IntegrationDetailSchema,
  IntegrationRecentActivitySchema,
  IntegrationChannelSchema,
} from "@workspace/types"

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

/** PATCH bodies: strict partials without defaults so union / parse cannot clobber unrelated fields. */
export const patchSlackSettingsBodySchema = z
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

export const patchLinearSettingsBodySchema = z
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

export const patchSlackChannelBodySchema = z.object({
  channelId: z.string().min(1),
  channelName: z.string().min(1),
})

export const integrationErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})
