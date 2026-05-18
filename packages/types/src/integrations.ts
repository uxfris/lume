import { z } from "zod";

export const IntegrationCategoryEnum = z.enum([
    "Work Management",
    "Team communication",
    "Knowledge Base",
    "Product & Engineering",
    "Revenue & Automation"
])

export const IntegrationStatusEnum = z.enum([
    "connected",
    "disconnected",
    "coming soon"
])

export const IntegrationProviderIdSchema = z.enum(["slack", "linear"])

export type IntegrationProviderId = z.infer<typeof IntegrationProviderIdSchema>

export const IntegrationSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: IntegrationCategoryEnum,
    logo: z.string(),
    status: IntegrationStatusEnum,
    featured: z.boolean().optional(),
});

export type Integration = z.infer<typeof IntegrationSchema>

export const IntegrationRecentActivitySchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    timestamp: z.string(),
    status: z.enum(["SUCCEEDED", "FAILED"]).optional(),
})

export type IntegrationRecentActivity = z.infer<typeof IntegrationRecentActivitySchema>

export const SlackIntegrationConfigSchema = z.object({
    defaultChannelId: z.string().nullable().optional(),
    defaultChannelName: z.string().nullable().optional(),
    autoPostSummaries: z.boolean().default(true),
    tagActionItemOwners: z.boolean().default(true),
    sendDmToOrganizer: z.boolean().default(false),
    includeTranscriptLink: z.boolean().default(true),
    channelAccessOk: z.boolean().default(true),
})

export type SlackIntegrationConfig = z.infer<typeof SlackIntegrationConfigSchema>

export const LinearIntegrationConfigSchema = z.object({
    autoCreateIssues: z.boolean().default(true),
    autoAssignParticipants: z.boolean().default(true),
    autoSetDueDate: z.boolean().default(true),
    defaultPriority: z.enum(["urgent", "medium", "low"]).default("medium"),
    defaultTeamId: z.string().nullable().optional(),
    defaultTeamName: z.string().nullable().optional(),
    defaultProjectId: z.string().nullable().optional(),
})

export type LinearIntegrationConfig = z.infer<typeof LinearIntegrationConfigSchema>

export const IntegrationDetailSchema = z.object({
    id: IntegrationProviderIdSchema,
    name: z.string(),
    description: z.string(),
    logo: z.string(),
    status: z.enum(["connected", "disconnected"]),
    connectedAccountLabel: z.string().nullable(),
    slackConfig: SlackIntegrationConfigSchema.optional(),
    linearConfig: LinearIntegrationConfigSchema.optional(),
    stats: z
        .object({
            issuesCreated: z.number(),
            autoAssigned: z.number(),
            meetingsConnected: z.number(),
        })
        .optional(),
    channelAccessOk: z.boolean().optional(),
})

export type IntegrationDetail = z.infer<typeof IntegrationDetailSchema>

export const IntegrationChannelSchema = z.object({
    id: z.string(),
    name: z.string(),
})

export type IntegrationChannel = z.infer<typeof IntegrationChannelSchema>

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
    url: z.string(),
})
