import { useQuery } from "@tanstack/react-query"
import { resolveInitialWorkspaceId } from "@/lib/workspace"
import type { GetMeResponse, WorkspaceMembership } from "@workspace/types"
import { workspaceKeys } from "../../_lib/workspace.keys"
import { workspaceApi } from "@workspace/api-client"

type Args = {
  workspaceId: string | null
}

export function useWorkspacesQuery({ workspaceId }: Args) {
  const query = useQuery<GetMeResponse>({
    queryKey: workspaceKeys.me(),
    queryFn: () => workspaceApi.getMe(),
    staleTime: 60_000,
  })

  const errorMessage = query.isError ? "Unable to load your workspaces." : null

  const resolvedWorkspaceId = query.data
    ? resolveInitialWorkspaceId({
        workspaces: query.data.workspaces,
        activeWorkspaceId: query.data.activeWorkspaceId,
        persistedWorkspaceId: workspaceId,
      })
    : null

  const activeWorkspace: WorkspaceMembership | undefined =
    query.data?.workspaces.find((w) => w.id === workspaceId) ??
    query.data?.workspaces[0]

  return {
    data: query.data,
    isLoading: query.isLoading,
    errorMessage,
    workspaces: query.data?.workspaces ?? [],
    activeWorkspace,
    resolvedWorkspaceId,
  }
}
