import { prisma, Prisma } from "@workspace/database"

export const tasksRepo = {
  async listForWorkspace(input: {
    workspaceId: string
    currentUserId: string
    filter: "all" | "assigned_to_me" | "from_last_meeting" | "completed"
  }) {
    const { workspaceId, currentUserId, filter } = input

    const where: Prisma.TaskWhereInput = {
      workspaceId,
      OR: [{ meetingId: null }, { meeting: { deletedAt: null } }],
    }

    if (filter === "completed") {
      where.isCompleted = true
    } else if (filter === "assigned_to_me") {
      where.assigneeId = currentUserId
    } else if (filter === "from_last_meeting") {
      where.isCompleted = false

      const latestMeeting = await prisma.meeting.findFirst({
        where: { workspaceId, deletedAt: null },
        select: { id: true },
        orderBy: { updatedAt: "desc" },
      })

      if (!latestMeeting) return []
      where.meetingId = latestMeeting.id
    }

    return prisma.task.findMany({
      where,
      include: {
        assignee: true,
        meeting: true,
      },
      orderBy: { createdAt: "desc" },
    })
  },

  findByIdForWorkspace(taskId: string, workspaceId: string) {
    return prisma.task.findFirst({
      where: { id: taskId, workspaceId },
      include: { assignee: true, meeting: true },
    })
  },

  countMembers(workspaceId: string, userId: string) {
    return prisma.workspaceMember.count({
      where: { workspaceId, userId },
    })
  },

  create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({ data, include: { assignee: true } })
  },

  update(
    taskId: string,
    workspaceId: string,
    data: Prisma.TaskUncheckedUpdateInput
  ) {
    return prisma.task.updateMany({
      where: { id: taskId, workspaceId },
      data,
    })
  },

  remove(taskId: string, workspaceId: string) {
    return prisma.task.deleteMany({
      where: { id: taskId, workspaceId },
    })
  },

  findLatestAnalyzedMeeting(workspaceId: string) {
    return prisma.meeting.findFirst({
      where: {
        workspaceId,
        deletedAt: null,
        summary: { not: undefined },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        summary: true,
      },
    })
  },

  listOpenTasksForMeeting(workspaceId: string, meetingId: string) {
    return prisma.task.findMany({
      where: {
        workspaceId,
        meetingId,
        isCompleted: false,
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true },
    })
  },

  listOpenTasksForWorkspace(workspaceId: string) {
    return prisma.task.findMany({
      where: {
        workspaceId,
        isCompleted: false,
        OR: [{ meetingId: null }, { meeting: { deletedAt: null } }],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    })
  },

  listTranscriptTexts(meetingId: string) {
    return prisma.transcriptSegment.findMany({
      where: { meetingId },
      orderBy: { index: "asc" },
      select: { text: true },
    })
  },
}
