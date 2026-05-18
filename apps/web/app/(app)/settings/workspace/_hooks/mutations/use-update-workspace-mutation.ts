import { useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceApi } from "@workspace/api-client"
import type { ApiError } from "@workspace/api-client"
import type { UpdateWorkspaceBody, WorkspaceSummary } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { workspaceKeys } from "../../_lib/workspace.keys"

type UpdateWorkspaceState = {
  update: (body: UpdateWorkspaceBody) => Promise<WorkspaceSummary>
  isPending: boolean
}

export function useUpdateWorkspaceMutation(): UpdateWorkspaceState {
  const queryClient = useQueryClient()
  const { workspaceId } = useCurrentWorkspace()

  const mutation = useMutation({
    mutationFn: async (body: UpdateWorkspaceBody) => {
      if (!workspaceId) throw new Error("No workspace selected")
      return workspaceApi.update(workspaceId, body)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.me() })
    },
    meta: {
      getErrorMessage: (error: ApiError) => {
        if (error.detail === "SLUG_TAKEN" || error.detail?.includes("SLUG_TAKEN")) {
          return "This handle is already taken."
        }
        return error.detail || error.title || "Failed to update workspace"
      },
    },
  })

  return {
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
