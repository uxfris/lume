import {
  prisma,
  type IntegrationProvider,
  type Prisma,
} from "@workspace/database"

export const integrationsRepo = {
  findByWorkspace(workspaceId: string) {
    return prisma.workspaceIntegration.findMany({
      where: { workspaceId },
    })
  },

  findOne(workspaceId: string, provider: IntegrationProvider) {
    return prisma.workspaceIntegration.findUnique({
      where: {
        workspaceId_provider: { workspaceId, provider },
      },
    })
  },

  upsertConnection(input: {
    workspaceId: string
    provider: IntegrationProvider
    accessToken: string
    refreshToken?: string | null
    externalAccountId?: string | null
    externalAccountName?: string | null
    connectedByUserId: string
    config: Prisma.InputJsonValue
  }) {
    return prisma.workspaceIntegration.upsert({
      where: {
        workspaceId_provider: {
          workspaceId: input.workspaceId,
          provider: input.provider,
        },
      },
      create: {
        workspaceId: input.workspaceId,
        provider: input.provider,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken ?? null,
        externalAccountId: input.externalAccountId ?? null,
        externalAccountName: input.externalAccountName ?? null,
        connectedByUserId: input.connectedByUserId,
        connectedAt: new Date(),
        config: input.config,
      },
      update: {
        accessToken: input.accessToken,
        refreshToken: input.refreshToken ?? null,
        externalAccountId: input.externalAccountId ?? null,
        externalAccountName: input.externalAccountName ?? null,
        connectedByUserId: input.connectedByUserId,
        connectedAt: new Date(),
        config: input.config,
      },
    })
  },

  updateConfig(
    workspaceId: string,
    provider: IntegrationProvider,
    config: Prisma.InputJsonValue
  ) {
    return prisma.workspaceIntegration.update({
      where: {
        workspaceId_provider: { workspaceId, provider },
      },
      data: { config },
    })
  },

  disconnect(workspaceId: string, provider: IntegrationProvider) {
    return prisma.workspaceIntegration.update({
      where: {
        workspaceId_provider: { workspaceId, provider },
      },
      data: {
        accessToken: null,
        refreshToken: null,
        externalAccountId: null,
        externalAccountName: null,
        connectedByUserId: null,
        connectedAt: null,
      },
    })
  },

  listActivity(input: {
    workspaceId: string
    provider: IntegrationProvider
    limit?: number
  }) {
    return prisma.integrationActivity.findMany({
      where: {
        workspaceId: input.workspaceId,
        provider: input.provider,
      },
      orderBy: { createdAt: "desc" },
      take: input.limit ?? 20,
    })
  },

  countActivityStats(workspaceId: string, provider: IntegrationProvider) {
    return Promise.all([
      prisma.integrationActivity.count({
        where: {
          workspaceId,
          provider,
          status: "SUCCEEDED",
          title: { contains: "issues created", mode: "insensitive" },
        },
      }),
      prisma.integrationActivity.count({
        where: {
          workspaceId,
          provider,
          status: "SUCCEEDED",
          title: { contains: "assigned", mode: "insensitive" },
        },
      }),
      prisma.integrationActivity.findMany({
        where: {
          workspaceId,
          provider,
          status: "SUCCEEDED",
          meetingId: { not: null },
        },
        select: { meetingId: true },
        distinct: ["meetingId"],
      }),
    ])
  },

  createActivity(input: {
    workspaceId: string
    provider: IntegrationProvider
    meetingId?: string | null
    status: "SUCCEEDED" | "FAILED"
    title: string
    description?: string | null
  }) {
    return prisma.integrationActivity.create({ data: input })
  },
}
