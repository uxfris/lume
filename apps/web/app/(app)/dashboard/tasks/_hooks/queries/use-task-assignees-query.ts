import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { taskApi } from "@workspace/api-client"
import { taskKeys } from "../../_lib/task.keys"
import { UserSummary } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useTaskAssigneesQuery(): UseQueryResult<UserSummary[], Error> {
  const { workspaceId } = useCurrentWorkspace()
  return useQuery({
    queryKey: taskKeys.assignees(workspaceId),
    queryFn: () => taskApi.fetchAssignees(),
    staleTime: 300_000,
  })
}
