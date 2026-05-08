import { prisma, type Prisma } from "@workspace/database"

export const calendarRepo = {
  listUpcomingByWorkspace(input: {
    workspaceId: string
    from: Date
    to: Date
    take: number
  }) {
    return prisma.calendarEvent.findMany({
      where: {
        workspaceId: input.workspaceId,
        startAt: {
          gte: input.from,
          lt: input.to,
        },
      },
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
      take: input.take,
    })
  },
  findOAuthAccount(input: { userId: string; providerId: "google" | "microsoft" }) {
    return prisma.account.findFirst({
      where: {
        userId: input.userId,
        providerId: input.providerId,
      },
      select: {
        refreshToken: true,
      },
    })
  },
}

export type CalendarEventRow = Prisma.CalendarEventGetPayload<Record<string, never>>
