import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { UserSummary } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { peopleKeys } from "../../_lib/people.keys"
import { peopleApi } from "@workspace/api-client"

export function useMembersQuery(): UseQueryResult<UserSummary[], Error> {
  const { workspaceId } = useCurrentWorkspace()
  return useQuery({
    queryKey: peopleKeys.members(workspaceId),
    queryFn: () => peopleApi.fetchMembers(),
    staleTime: 300_000,
  })
}
