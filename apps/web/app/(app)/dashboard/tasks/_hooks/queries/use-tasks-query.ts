import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { taskApi, type TaskListFilter } from "@workspace/api-client"
import { taskKeys } from "../../_lib/task.keys"
import { TasksGroup } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useTasksQuery(
  filter: TaskListFilter = "all"
): UseQueryResult<TasksGroup[], Error> {
  const { workspaceId } = useCurrentWorkspace()
  return useQuery({
    queryKey: taskKeys.list(workspaceId, filter),
    queryFn: () => taskApi.fetchTasksGroup(filter),
    staleTime: 20_000,
  })
}
