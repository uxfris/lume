import type { ActionItem, TasksGroup, UserSummary } from "@workspace/types"
import { client, type RequestOptions } from "./client"

export type CreateTaskInput = {
  title: string
  isCompleted: boolean
  assignee: UserSummary | null
  /** Omit or pass null for workspace-level tasks (not tied to a meeting). */
  meetingId?: string | null
}

export type TaskListFilter =
  | "all"
  | "assigned_to_me"
  | "from_last_meeting"
  | "completed"

export const taskApi = {
  async fetchTasksGroup(
    options?: RequestOptions,
    filter: TaskListFilter = "all"
  ): Promise<TasksGroup[]> {
    const query = new URLSearchParams({ filter }).toString()
    return client.get<TasksGroup[]>(`/tasks?${query}`, options)
  },

  async fetchAssignees(options?: RequestOptions): Promise<UserSummary[]> {
    return client.get<UserSummary[]>("/tasks/assignees", options)
  },

  async toggle(
    id: string,
    isCompleted: boolean,
    options?: RequestOptions
  ): Promise<void> {
    await client.post(`/tasks/${id}/toggle`, { isCompleted }, options)
  },

  async add(
    input: CreateTaskInput,
    options?: RequestOptions
  ): Promise<ActionItem> {
    return client.post<ActionItem>(
      "/tasks",
      {
        title: input.title,
        isCompleted: input.isCompleted,
        meetingId: input.meetingId ?? null,
        assigneeId: input.assignee?.id ?? null,
      },
      options
    )
  },

  async remove(id: string, options?: RequestOptions): Promise<void> {
    await client.delete(`/tasks/${id}`, options)
  },

  async updateTitle(
    id: string,
    title: string,
    options?: RequestOptions
  ): Promise<void> {
    await client.patch(`/tasks/${id}`, { title }, options)
  },

  async updateAssignee(
    id: string,
    assignee: UserSummary | null,
    options?: RequestOptions
  ): Promise<void> {
    await client.patch(
      `/tasks/${id}`,
      {
        assigneeId: assignee?.id ?? null,
      },
      options
    )
  },
}
