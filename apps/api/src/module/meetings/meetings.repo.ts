import {
  prisma,
  transcribedMinutesFromDuration,
  utcBillingPeriod,
  type Prisma,
} from "@workspace/database"

export type MeetingWithOwner = Prisma.MeetingGetPayload<{
  include: { user: true }
}>
export type TranscriptSegmentWithParticipant =
  Prisma.TranscriptSegmentGetPayload<{
    include: {
      participant: { select: { name: true; externalId: true } }
      transcriptWords: {
        select: {
          id: true
          text: true
          startMs: true
          endMs: true
          position: true
        }
      }
    }
  }>

export const meetingsRepo = {
  listLiveByWorkspace(input: { workspaceId: string }) {
    return prisma.meeting.findMany({
      where: {
        workspaceId: input.workspaceId,
        deletedAt: null,
        status: "LIVE",
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        meetingUrl: true,
      },
    })
  },
  /**
   * Ordered page of meetings; caller passes `take` (e.g. limit + 1 for has-next detection).
   */
  listByWorkspace(input: {
    workspaceId: string
    take: number
    cursor?: { createdAt: Date; id: string }
    isStarred?: boolean
  }): Promise<MeetingWithOwner[]> {
    const where: Prisma.MeetingWhereInput = {
      workspaceId: input.workspaceId,
      deletedAt: null,
      status: {
        notIn: ["SCHEDULED", "LIVE"],
      },
      ...(input.cursor
        ? {
            OR: [
              { createdAt: { lt: input.cursor.createdAt } },
              {
                AND: [
                  { createdAt: input.cursor.createdAt },
                  { id: { lt: input.cursor.id } },
                ],
              },
            ],
          }
        : {}),
      ...(input.isStarred !== undefined ? { isStarred: input.isStarred } : {}),
    }

    return prisma.meeting.findMany({
      where,
      include: { user: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    })
  },

  findMeetingIdInWorkspace(
    meetingId: string,
    workspaceId: string
  ): Promise<{ id: string } | null> {
    return prisma.meeting.findFirst({
      where: { id: meetingId, workspaceId, deletedAt: null },
      select: { id: true },
    })
  },

  findMeetingForUser(input: {
    meetingId: string
    userId: string
    workspaceId?: string
  }): Promise<{ id: string; workspaceId: string } | null> {
    return prisma.meeting.findFirst({
      where: {
        id: input.meetingId,
        deletedAt: null,
        workspaceId: input.workspaceId,
        workspace: {
          members: {
            some: { userId: input.userId },
          },
        },
      },
      select: { id: true, workspaceId: true },
    })
  },

  /** Whether an active (non-deleted) meeting exists in the workspace. */
  existsActiveInWorkspace(
    meetingId: string,
    workspaceId: string
  ): Promise<boolean> {
    return prisma.meeting
      .findFirst({
        where: { id: meetingId, workspaceId, deletedAt: null },
        select: { id: true },
      })
      .then((row) => !!row)
  },

  listTranscriptSegments(meetingId: string) {
    return prisma.transcriptSegment.findMany({
      where: { meetingId },
      orderBy: { index: "asc" },
      include: {
        participant: {
          select: { name: true, externalId: true },
        },
        transcriptWords: {
          select: {
            id: true,
            text: true,
            startMs: true,
            endMs: true,
            position: true,
          },
          orderBy: { position: "asc" },
        },
      },
    })
  },

  findByIdForWorkspace(
    meetingId: string,
    workspaceId: string
  ): Promise<MeetingWithOwner | null> {
    return prisma.meeting.findFirst({
      where: { id: meetingId, workspaceId, deletedAt: null },
      include: { user: true },
    })
  },

  async updateByWorkspace(input: {
    meetingId: string
    workspaceId: string
    data: Prisma.MeetingUpdateInput
  }): Promise<{ updated: number }> {
    const result = await prisma.meeting.updateMany({
      where: {
        id: input.meetingId,
        workspaceId: input.workspaceId,
        deletedAt: null,
      },
      data: input.data,
    })
    return { updated: result.count }
  },

  async softDelete(meetingId: string, workspaceId: string): Promise<number> {
    return prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.findFirst({
        where: {
          id: meetingId,
          workspaceId,
          deletedAt: null,
        },
        select: {
          id: true,
          createdAt: true,
          durationSeconds: true,
          billingUsageRecorded: true,
        },
      })

      if (!meeting) {
        return 0
      }

      await tx.meeting.update({
        where: { id: meeting.id },
        data: { deletedAt: new Date() },
      })

      if (!meeting.billingUsageRecorded) {
        return 1
      }

      const period = utcBillingPeriod(meeting.createdAt)
      const minutesToSubtract = transcribedMinutesFromDuration(
        meeting.durationSeconds
      )

      const usage = await tx.usageCounter.findUnique({
        where: {
          workspaceId_period: {
            workspaceId,
            period,
          },
        },
        select: {
          minutesTranscribed: true,
          meetingsTranscribed: true,
        },
      })

      if (!usage) {
        return 1
      }

      await tx.usageCounter.update({
        where: {
          workspaceId_period: {
            workspaceId,
            period,
          },
        },
        data: {
          minutesTranscribed: Math.max(
            0,
            usage.minutesTranscribed - minutesToSubtract
          ),
          meetingsTranscribed: Math.max(0, usage.meetingsTranscribed - 1),
        },
      })

      return 1
    })
  },
}
