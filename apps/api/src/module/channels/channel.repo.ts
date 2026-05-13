import { prisma, type Prisma } from "@workspace/database"

export const channelRepo = {
  listVisibleByWorkspace(workspaceId: string, userId: string) {
    return prisma.channel.findMany({
      where: {
        workspaceId,
        OR: [{ type: "PUBLIC" }, { creatorId: userId }],
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            meetings: true,
          },
        },
      },
    })
  },

  findAccessibleById(input: {
    channelId: string
    workspaceId: string
    userId: string
  }) {
    return prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: input.workspaceId,
        OR: [{ type: "PUBLIC" }, { creatorId: input.userId }],
      },
      include: {
        _count: {
          select: {
            meetings: true,
          },
        },
      },
    })
  },

  create(input: {
    workspaceId: string
    creatorId: string
    name: string
    description?: string | null
    type: "PUBLIC" | "PRIVATE"
  }) {
    return prisma.channel.create({
      data: {
        workspaceId: input.workspaceId,
        creatorId: input.creatorId,
        name: input.name,
        description: input.description,
        type: input.type,
      },
      include: {
        _count: {
          select: {
            meetings: true,
          },
        },
      },
    })
  },

  updateByWorkspace(input: {
    channelId: string
    workspaceId: string
    data: Prisma.ChannelUpdateManyMutationInput
  }) {
    return prisma.channel.updateMany({
      where: {
        id: input.channelId,
        workspaceId: input.workspaceId,
      },
      data: input.data,
    })
  },

  removeByWorkspace(channelId: string, workspaceId: string) {
    return prisma.channel.deleteMany({
      where: {
        id: channelId,
        workspaceId,
      },
    })
  },

  listMeetingsByChannel(input: {
    workspaceId: string
    channelId: string
    limit: number
  }) {
    return prisma.meeting.findMany({
      where: {
        workspaceId: input.workspaceId,
        channelId: input.channelId,
        deletedAt: null,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
      include: {
        user: true,
      },
    })
  },

  assignMeetingsToChannel(input: {
    workspaceId: string
    channelId: string
    meetingIds: string[]
  }) {
    return prisma.meeting.updateMany({
      where: {
        workspaceId: input.workspaceId,
        id: { in: input.meetingIds },
        deletedAt: null,
      },
      data: {
        channelId: input.channelId,
      },
    })
  },

  unassignMeetingsFromChannel(input: {
    workspaceId: string
    channelId: string
    meetingIds: string[]
  }) {
    return prisma.meeting.updateMany({
      where: {
        workspaceId: input.workspaceId,
        channelId: input.channelId,
        deletedAt: null,
        id: { in: input.meetingIds },
      },
      data: {
        channelId: null,
      },
    })
  },
}
