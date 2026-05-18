import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { taskApi } from "@workspace/api-client"
import type { TaskProductivityResponse } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { taskKeys } from "../../_lib/task.keys"

export function useTaskProductivityQuery(): UseQueryResult<
  TaskProductivityResponse,
  Error
> {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery({
    queryKey: taskKeys.productivity(workspaceId),
    queryFn: () => taskApi.fetchProductivity(),
    staleTime: 60_000,
  })
}
