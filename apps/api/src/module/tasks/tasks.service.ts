import type { Prisma } from "@workspace/database"
import type { ActionItem, TasksGroup, UserSummary } from "@workspace/types"
import { meetingsRepo } from "../meetings/meetings.repo"
import {
  groupTasksIntoMeetingGroups,
  toActionItem,
  toUserSummary,
} from "./tasks.presenter"
import { tasksRepo } from "./tasks.repo"

export type TaskListFilter =
  | "all"
  | "assigned_to_me"
  | "from_last_meeting"
  | "completed"

export async function listTaskGroups(
  input: {
    workspaceId: string
    currentUserId: string
    filter: TaskListFilter
  }
): Promise<TasksGroup[]> {
  const rows = await tasksRepo.listForWorkspace({
    workspaceId: input.workspaceId,
    filter: input.filter,
    currentUserId: input.currentUserId,
  })
  return groupTasksIntoMeetingGroups(rows)
}

export async function listAssignees(
  workspaceId: string
): Promise<UserSummary[]> {
  const members = await tasksRepo.listMembersWithUsers(workspaceId)
  return members.map((m) => toUserSummary(m.user))
}

export async function createTask(input: {
  workspaceId: string
  title: string
  isCompleted: boolean
  meetingId?: string | null
  assigneeId?: string | null
}): Promise<ActionItem | { error: "MEETING_NOT_FOUND" | "ASSIGNEE_INVALID" }> {
  if (input.meetingId) {
    const ok = await meetingsRepo.existsActiveInWorkspace(
      input.meetingId,
      input.workspaceId
    )
    if (!ok) return { error: "MEETING_NOT_FOUND" }
  }

  if (input.assigneeId) {
    const n = await tasksRepo.countMembers(
      input.workspaceId,
      input.assigneeId
    )
    if (n === 0) return { error: "ASSIGNEE_INVALID" }
  }

  const task = await tasksRepo.create({
    workspace: { connect: { id: input.workspaceId } },
    title: input.title,
    isCompleted: input.isCompleted,
    ...(input.meetingId
      ? { meeting: { connect: { id: input.meetingId } } }
      : {}),
    ...(input.assigneeId
      ? { assignee: { connect: { id: input.assigneeId } } }
      : {}),
  })

  return toActionItem(task)
}

export async function patchTask(input: {
  workspaceId: string
  taskId: string
  title?: string
  assigneeId?: string | null
}): Promise<
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "ASSIGNEE_INVALID" }
> {
  const existing = await tasksRepo.findByIdForWorkspace(
    input.taskId,
    input.workspaceId
  )
  if (!existing) return { ok: false, reason: "NOT_FOUND" }

  if (input.assigneeId !== undefined && input.assigneeId !== null) {
    const n = await tasksRepo.countMembers(
      input.workspaceId,
      input.assigneeId
    )
    if (n === 0) return { ok: false, reason: "ASSIGNEE_INVALID" }
  }

  const data: Prisma.TaskUncheckedUpdateInput = {}
  if (input.title !== undefined) data.title = input.title
  if (input.assigneeId !== undefined) data.assigneeId = input.assigneeId

  if (Object.keys(data).length === 0) return { ok: true }

  await tasksRepo.update(input.taskId, input.workspaceId, data)
  return { ok: true }
}

export async function toggleTask(input: {
  workspaceId: string
  taskId: string
  isCompleted: boolean
}): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" }> {
  const result = await tasksRepo.update(input.taskId, input.workspaceId, {
    isCompleted: input.isCompleted,
  })
  return result.count > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}

export async function deleteTask(input: {
  workspaceId: string
  taskId: string
}): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" }> {
  const result = await tasksRepo.remove(input.taskId, input.workspaceId)
  return result.count > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}
