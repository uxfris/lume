import { prisma, type Prisma } from "@workspace/database"

export type MeetingWithOwner = Prisma.MeetingGetPayload<{
  include: { user: true }
}>
export type TranscriptSegmentWithParticipant = Prisma.TranscriptSegmentGetPayload<{
  include: {
    participant: { select: { name: true; externalId: true } }
    transcriptWords: { select: { id: true; text: true; startMs: true; endMs: true; position: true } }
  }
}>

export const meetingsRepo = {
  /**
   * Ordered page of meetings; caller passes `take` (e.g. limit + 1 for has-next detection).
   */
  listByWorkspace(input: {
    workspaceId: string
    take: number
    cursor?: { createdAt: Date; id: string }
  }): Promise<MeetingWithOwner[]> {
    const where: Prisma.MeetingWhereInput = {
      workspaceId: input.workspaceId,
      deletedAt: null,
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
    const result = await prisma.meeting.updateMany({
      where: {
        id: meetingId,
        workspaceId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    })
    return result.count
  },
}
