import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { taskApi } from "@workspace/api-client"
import { taskKeys } from "../../_lib/task-query-keys"
import { UserSummary } from "@workspace/types"

export function useTaskAssigneesQuery(): UseQueryResult<UserSummary[], Error> {
  return useQuery({
    queryKey: taskKeys.assignees(),
    queryFn: () => taskApi.fetchAssignees(),
    staleTime: 300_000,
  })
}
