import {
  prisma,
  type MeetingGeneralAccess,
  type MeetingShareRole,
  type Prisma,
} from "@workspace/database"

export type MeetingShareContext = Prisma.MeetingGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true; image: true } }
    meetingShares: {
      include: {
        user: { select: { id: true; name: true; email: true; image: true } }
      }
    }
  }
}>

export const meetingShareRepo = {
  findMeetingById(meetingId: string): Promise<MeetingShareContext | null> {
    return prisma.meeting.findFirst({
      where: { id: meetingId, deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        meetingShares: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })
  },

  isWorkspaceMember(workspaceId: string, userId: string): Promise<boolean> {
    return prisma.workspaceMember
      .findFirst({
        where: { workspaceId, userId },
        select: { id: true },
      })
      .then((row) => Boolean(row))
  },

  findMeetingContext(
    meetingId: string,
    workspaceId: string
  ): Promise<MeetingShareContext | null> {
    return prisma.meeting.findFirst({
      where: { id: meetingId, workspaceId, deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        meetingShares: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })
  },

  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true },
    })
  },

  upsertShare(input: {
    meetingId: string
    email: string
    userId: string | null
    role: MeetingShareRole
    invitedByUserId: string
  }) {
    return prisma.meetingShare.upsert({
      where: {
        meetingId_email: { meetingId: input.meetingId, email: input.email },
      },
      create: {
        meetingId: input.meetingId,
        email: input.email,
        userId: input.userId,
        role: input.role,
        invitedByUserId: input.invitedByUserId,
      },
      update: {
        role: input.role,
        userId: input.userId ?? undefined,
        invitedByUserId: input.invitedByUserId,
      },
    })
  },

  updateShareRole(input: {
    shareId: string
    meetingId: string
    role: MeetingShareRole
  }) {
    return prisma.meetingShare.updateMany({
      where: { id: input.shareId, meetingId: input.meetingId },
      data: { role: input.role },
    })
  },

  deleteShare(shareId: string, meetingId: string) {
    return prisma.meetingShare.deleteMany({
      where: { id: shareId, meetingId },
    })
  },

  updateGeneralAccess(input: {
    meetingId: string
    workspaceId: string
    generalAccess: MeetingGeneralAccess
    isShared: boolean
  }) {
    return prisma.meeting.updateMany({
      where: {
        id: input.meetingId,
        workspaceId: input.workspaceId,
        deletedAt: null,
      },
      data: {
        generalAccess: input.generalAccess,
        isShared: input.isShared,
      },
    })
  },

  linkSharesToUser(userId: string, email: string) {
    const normalized = email.trim().toLowerCase()
    return prisma.meetingShare.updateMany({
      where: { email: normalized, userId: null },
      data: { userId },
    })
  },

  findShareForUser(input: {
    meetingId: string
    userId: string
    email: string
  }) {
    return prisma.meetingShare.findFirst({
      where: {
        meetingId: input.meetingId,
        OR: [{ userId: input.userId }, { email: input.email }],
      },
    })
  },
}
