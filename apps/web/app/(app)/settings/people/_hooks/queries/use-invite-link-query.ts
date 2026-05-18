import { useQuery } from "@tanstack/react-query"
import { workspaceApi } from "@workspace/api-client"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { peopleKeys } from "../../_lib/people.keys"

export function useInviteLinkQuery() {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery({
    queryKey: peopleKeys.inviteLink(workspaceId),
    queryFn: () => {
      if (!workspaceId) throw new Error("No workspace selected")
      return workspaceApi.getInviteLink(workspaceId)
    },
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
  })
}
