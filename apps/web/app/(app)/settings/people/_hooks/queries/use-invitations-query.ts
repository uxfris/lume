import { useQuery } from "@tanstack/react-query"
import { workspaceApi } from "@workspace/api-client"
import type { WorkspaceMemberInvitation } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { peopleKeys } from "../../_lib/people.keys"

export function useInvitationsQuery() {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery<WorkspaceMemberInvitation[]>({
    queryKey: peopleKeys.invitations(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error("No workspace selected")
      }
      return workspaceApi.listInvitations(workspaceId)
    },
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
  })
}
