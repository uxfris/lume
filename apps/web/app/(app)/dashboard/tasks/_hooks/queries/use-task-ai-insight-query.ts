import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { taskApi } from "@workspace/api-client"
import type { TaskAIInsightResponse } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { taskKeys } from "../../_lib/task.keys"

export function useTaskAIInsightQuery(): UseQueryResult<
  TaskAIInsightResponse,
  Error
> {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery({
    queryKey: taskKeys.insight(workspaceId),
    queryFn: () => taskApi.fetchAIInsight(),
    staleTime: 60_000,
  })
}
