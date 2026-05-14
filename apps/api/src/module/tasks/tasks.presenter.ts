import type { ActionItem, TasksGroup, UserSummary } from "@workspace/types"
import { initialsFromName } from "../meetings/meetings.presenter"
import { toUserSummary } from "../people/people.presenter"

export function toActionItem(task: {
  id: string
  title: string
  isCompleted: boolean
  assignee: {
    id: string
    name: string
    image: string | null
  } | null
}): ActionItem {
  return {
    id: task.id,
    title: task.title,
    isCompleted: task.isCompleted,
    assignee: task.assignee ? toUserSummary(task.assignee) : null,
  }
}

const UNGROUPED_ID = "workspace"

export function groupTasksIntoMeetingGroups(
  rows: Array<{
    id: string
    title: string
    isCompleted: boolean
    meetingId: string | null
    createdAt: Date
    meeting: { title: string; updatedAt: Date } | null
    assignee: {
      id: string
      name: string
      image: string | null
    } | null
  }>
): TasksGroup[] {
  const groupMap = new Map<
    string,
    { title: string; timestamp: string; tasks: ActionItem[] }
  >()
  const groupOrder: string[] = []
  const seen = new Set<string>()

  for (const t of rows) {
    const key = t.meetingId ?? UNGROUPED_ID
    const title = t.meeting?.title ?? "Workspace"
    const timestamp = (t.meeting?.updatedAt ?? t.createdAt).toISOString()
    if (!seen.has(key)) {
      seen.add(key)
      groupOrder.push(key)
      groupMap.set(key, { title, timestamp, tasks: [] })
    }
    const g = groupMap.get(key)!
    g.tasks.push(
      toActionItem({
        id: t.id,
        title: t.title,
        isCompleted: t.isCompleted,
        assignee: t.assignee,
      })
    )
  }

  return groupOrder.map((id) => {
    const g = groupMap.get(id)!
    return {
      id,
      title: g.title,
      timestamp: g.timestamp,
      tasks: g.tasks,
    }
  })
}
