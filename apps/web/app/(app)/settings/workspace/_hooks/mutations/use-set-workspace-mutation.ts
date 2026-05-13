import { useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceKeys } from "../../_lib/workspace.keys"

type SetWorkspaceInput = {
  workspaceId: string | null
}

type setWorkspacePayload = {
  workspaceId: string
}

type useSetWorkspaceMutationReturn = {
  setWorkspace: (payload: setWorkspacePayload) => void
}

export function useSetWorkspaceMutation(): useSetWorkspaceMutationReturn {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ workspaceId }: SetWorkspaceInput) => {
      // optional backend persistence
      return workspaceId
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.all,
      })
    },
  })

  return {
    setWorkspace: mutation.mutate,
  }
}
