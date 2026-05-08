import {
  prisma,
  type Meeting,
  type MeetingPlatform,
  type Prisma,
} from "@workspace/database"

export const botsRepo = {
  /**
   * Create a SCHEDULED meeting row for a bot-sourced call. We persist the
   * platform, original URL, and (optional) scheduled timestamp so the
   * webhook handler can correlate Recall events back to a workspace.
   */
  createScheduledMeeting(input: {
    workspaceId: string
    userId: string
    title: string
    meetingUrl: string
    platform: MeetingPlatform
    scheduledAt?: Date
  }): Promise<Meeting> {
    return prisma.meeting.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        title: input.title,
        source: "BOT",
        status: "SCHEDULED",
        meetingUrl: input.meetingUrl,
        platform: input.platform,
        scheduledAt: input.scheduledAt,
      },
    })
  },

  attachExternalBotId(
    meetingId: string,
    externalBotId: string
  ): Promise<Meeting> {
    return prisma.meeting.update({
      where: { id: meetingId },
      data: { externalBotId },
    })
  },

  deleteMeeting(meetingId: string): Promise<Meeting> {
    return prisma.meeting.delete({ where: { id: meetingId } })
  },

  findByExternalBotId(externalBotId: string): Promise<Meeting | null> {
    return prisma.meeting.findUnique({ where: { externalBotId } })
  },

  updateMeeting(
    meetingId: string,
    data: Prisma.MeetingUpdateInput
  ): Promise<Meeting> {
    return prisma.meeting.update({ where: { id: meetingId }, data })
  },
}
