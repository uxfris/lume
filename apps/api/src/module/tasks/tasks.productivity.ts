import type { TaskProductivityStats } from "@workspace/types"

const MS_PER_DAY = 24 * 60 * 60 * 1000

export type CompletedTaskTiming = {
  createdAt: Date
  updatedAt: Date
}

function averageCompletionMs(tasks: CompletedTaskTiming[]): number | null {
  if (tasks.length === 0) return null

  const total = tasks.reduce((sum, task) => {
    const duration = task.updatedAt.getTime() - task.createdAt.getTime()
    return sum + Math.max(duration, 0)
  }, 0)

  return total / tasks.length
}

export function completionPacePercent(
  thisWeek: CompletedTaskTiming[],
  lastWeek: CompletedTaskTiming[]
): number | null {
  const thisAvg = averageCompletionMs(thisWeek)
  const lastAvg = averageCompletionMs(lastWeek)

  if (thisAvg == null || lastAvg == null || lastAvg <= 0) return null

  return Math.round(((lastAvg - thisAvg) / lastAvg) * 100)
}

export function partitionCompletedByWeek(
  tasks: CompletedTaskTiming[],
  now = new Date()
): { thisWeek: CompletedTaskTiming[]; lastWeek: CompletedTaskTiming[] } {
  const thisWeekStart = new Date(now.getTime() - 7 * MS_PER_DAY)
  const lastWeekStart = new Date(now.getTime() - 14 * MS_PER_DAY)

  const thisWeek: CompletedTaskTiming[] = []
  const lastWeek: CompletedTaskTiming[] = []

  for (const task of tasks) {
    const completedAt = task.updatedAt
    if (completedAt >= thisWeekStart) {
      thisWeek.push(task)
    } else if (completedAt >= lastWeekStart && completedAt < thisWeekStart) {
      lastWeek.push(task)
    }
  }

  return { thisWeek, lastWeek }
}

export function buildTaskProductivityStats(input: {
  created: number
  resolved: number
  recentCompleted: CompletedTaskTiming[]
  now?: Date
}): TaskProductivityStats | null {
  if (input.created === 0 && input.resolved === 0) return null

  const { thisWeek, lastWeek } = partitionCompletedByWeek(
    input.recentCompleted,
    input.now
  )
  const pacePercent = completionPacePercent(thisWeek, lastWeek)

  return {
    resolved: input.resolved,
    created: input.created,
    ...(pacePercent !== null ? { pacePercent } : {}),
  }
}
