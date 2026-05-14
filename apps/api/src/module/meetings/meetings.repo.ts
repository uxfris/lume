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

class SoftDeleteManyConflictError extends Error {
  constructor() {
    super("soft delete conflict")
    this.name = "SoftDeleteManyConflictError"
  }
}

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
    userId: string
    take: number
    cursor?: { createdAt: Date; id: string }
    isStarred?: boolean
    isCreatedByMe?: boolean
    isSharedWithMe?: boolean
    /** When set, only meetings assigned to this channel are returned. */
    channelId?: string
  }): Promise<MeetingWithOwner[]> {
    const where: Prisma.MeetingWhereInput = {
      workspaceId: input.workspaceId,
      deletedAt: null,
      ...(input.channelId !== undefined ? { channelId: input.channelId } : {}),
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
      ...(input.isCreatedByMe === true ? { userId: input.userId } : {}),
      ...(input.isSharedWithMe === true
        ? { isShared: true, NOT: { userId: input.userId } }
        : {}),
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

  /**
   * Soft-deletes meetings and adjusts usage counters (same semantics as the former per-meeting flow).
   * One transaction: validate rows, updateMany meetings, then one atomic decrement per billing period.
   */
  async softDeleteMany(input: {
    workspaceId: string
    meetingIds: string[]
  }): Promise<{ ok: true; deleted: number } | { ok: false }> {
    const uniqueIds = [...new Set(input.meetingIds)]
    if (uniqueIds.length === 0) {
      return { ok: false }
    }

    const deletedAt = new Date()

    try {
      return await prisma.$transaction(async (tx) => {
        const meetings = await tx.meeting.findMany({
          where: {
            id: { in: uniqueIds },
            workspaceId: input.workspaceId,
            deletedAt: null,
          },
          select: {
            id: true,
            createdAt: true,
            durationSeconds: true,
            billingUsageRecorded: true,
          },
        })

        if (meetings.length !== uniqueIds.length) {
          return { ok: false }
        }

        const usageDeltaByPeriod = new Map<
          string,
          { minutes: number; meetings: number }
        >()

        for (const m of meetings) {
          if (!m.billingUsageRecorded) continue

          const period = utcBillingPeriod(m.createdAt)
          const minutesToSubtract = transcribedMinutesFromDuration(
            m.durationSeconds
          )

          const prev = usageDeltaByPeriod.get(period) ?? {
            minutes: 0,
            meetings: 0,
          }
          prev.minutes += minutesToSubtract
          prev.meetings += 1
          usageDeltaByPeriod.set(period, prev)
        }

        const updated = await tx.meeting.updateMany({
          where: {
            id: { in: uniqueIds },
            workspaceId: input.workspaceId,
            deletedAt: null,
          },
          data: { deletedAt },
        })

        if (updated.count !== uniqueIds.length) {
          throw new SoftDeleteManyConflictError()
        }

        for (const [period, delta] of usageDeltaByPeriod) {
          await tx.$executeRaw`
            UPDATE "usage_counter"
            SET
              "minutesTranscribed" = GREATEST(0, "minutesTranscribed" - ${delta.minutes}),
              "meetingsTranscribed" = GREATEST(0, "meetingsTranscribed" - ${delta.meetings}),
              "updatedAt" = CURRENT_TIMESTAMP
            WHERE "workspaceId" = ${input.workspaceId}
              AND "period" = ${period}
          `
        }

        return { ok: true, deleted: uniqueIds.length }
      })
    } catch (err) {
      if (err instanceof SoftDeleteManyConflictError) {
        return { ok: false }
      }
      throw err
    }
  },

  async softDelete(meetingId: string, workspaceId: string): Promise<number> {
    const result = await meetingsRepo.softDeleteMany({
      workspaceId,
      meetingIds: [meetingId],
    })
    return result.ok ? 1 : 0
  },

  async findTargetMembership(input: {
    userId: string
    targetWorkspaceId: string
  }) {
    return prisma.workspaceMember.findFirst({
      where: {
        userId: input.userId,
        workspaceId: input.targetWorkspaceId,
      },
      select: { id: true },
    })
  },

  /**
   * Moves non-deleted meetings from one workspace to another (clears channel).
   * Updates tasks that reference those meetings to the destination workspace.
   */
  async moveManyToWorkspace(input: {
    fromWorkspaceId: string
    toWorkspaceId: string
    meetingIds: string[]
  }): Promise<{ ok: true } | { ok: false; reason: "NOT_ALL_FOUND" }> {
    const uniqueIds = [...new Set(input.meetingIds)]
    if (uniqueIds.length === 0) {
      return { ok: false, reason: "NOT_ALL_FOUND" }
    }

    return await prisma.$transaction(async (tx) => {
      const meetings = await tx.meeting.findMany({
        where: {
          id: { in: uniqueIds },
          workspaceId: input.fromWorkspaceId,
          deletedAt: null,
        },
        select: { id: true },
      })

      if (meetings.length !== uniqueIds.length) {
        return { ok: false, reason: "NOT_ALL_FOUND" }
      }

      const updated = await tx.meeting.updateMany({
        where: {
          id: { in: uniqueIds },
          workspaceId: input.fromWorkspaceId,
          deletedAt: null,
        },
        data: {
          workspaceId: input.toWorkspaceId,
          channelId: null,
        },
      })

      if (updated.count !== uniqueIds.length) {
        return { ok: false, reason: "NOT_ALL_FOUND" }
      }

      await tx.task.updateMany({
        where: { meetingId: { in: uniqueIds } },
        data: { workspaceId: input.toWorkspaceId },
      })

      return { ok: true }
    })
  },

  async unstarManyInWorkspace(input: {
    workspaceId: string
    meetingIds: string[]
  }): Promise<{ ok: true } | { ok: false }> {
    const uniqueIds = [...new Set(input.meetingIds)]
    if (uniqueIds.length === 0) {
      return { ok: false }
    }

    return await prisma.$transaction(async (tx) => {
      const meetings = await tx.meeting.findMany({
        where: {
          id: { in: uniqueIds },
          workspaceId: input.workspaceId,
          deletedAt: null,
        },
        select: { id: true },
      })

      if (meetings.length !== uniqueIds.length) {
        return { ok: false }
      }

      const updated = await tx.meeting.updateMany({
        where: {
          id: { in: uniqueIds },
          workspaceId: input.workspaceId,
          deletedAt: null,
        },
        data: { isStarred: false },
      })

      if (updated.count !== uniqueIds.length) {
        return { ok: false }
      }

      return { ok: true }
    })
  },
}
