import { TaskListFilter } from "@workspace/api-client"

export const taskKeys = {
  all: (workspaceId: string | null) => ["tasks", workspaceId] as const,

  lists: (workspaceId: string | null) =>
    [...taskKeys.all(workspaceId), "list"] as const,

  list: (workspaceId: string | null, filter: TaskListFilter) =>
    [...taskKeys.lists(workspaceId), filter] as const,

  insight: (workspaceId: string | null) =>
    [...taskKeys.all(workspaceId), "insight"] as const,
}
