import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { taskApi, type TaskListFilter } from "@workspace/api-client"
import { taskKeys } from "../../_lib/task-query-keys"
import { TasksGroup } from "@workspace/types"

export function useTasksQuery(
  filter: TaskListFilter = "all"
): UseQueryResult<TasksGroup[], Error> {
  return useQuery({
    queryKey: taskKeys.list(filter),
    queryFn: () => taskApi.fetchTasksGroup(filter),
    staleTime: 20_000,
  })
}
