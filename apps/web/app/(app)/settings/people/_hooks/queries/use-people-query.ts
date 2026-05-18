import { useQuery } from "@tanstack/react-query"
import { workspaceApi } from "@workspace/api-client"
import type { WorkspaceMember } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { peopleKeys } from "../../_lib/people.keys"

export function usePeopleQuery() {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery<WorkspaceMember[]>({
    queryKey: peopleKeys.members(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error("No workspace selected")
      }
      return workspaceApi.listPeople(workspaceId)
    },
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
  })
}
