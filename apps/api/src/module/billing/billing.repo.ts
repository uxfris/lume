import { prisma } from "@workspace/database"

export function findUsageCounter(workspaceId: string, period: string) {
  return prisma.usageCounter.findUnique({
    where: {
      workspaceId_period: { workspaceId, period },
    },
  })
}
