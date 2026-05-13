import { TaskListFilter } from "@workspace/api-client"

export const taskKeys = {
  all: () => ["tasks"] as const,

  lists: () => [...taskKeys.all(), "list"] as const,

  list: (filter: TaskListFilter) => [...taskKeys.lists(), filter] as const,

  assignees: () => [...taskKeys.all(), "assignees"] as const,
}
