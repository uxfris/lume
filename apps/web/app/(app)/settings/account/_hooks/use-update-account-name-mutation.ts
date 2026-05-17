import { useMutation, useQueryClient } from "@tanstack/react-query"
import { accountApi } from "@workspace/api-client"
import type { ApiError } from "@workspace/api-client"
import { authClient } from "@/lib/auth-client"
import { workspaceKeys } from "../../workspace/_lib/workspace.keys"
import { CurrentUser } from "@workspace/types"

type updateAccountNameState = {
  update: (payload: string) => Promise<CurrentUser>
  isPending: boolean
}

export function useUpdateAccountNameMutation(): updateAccountNameState {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (name: string) => accountApi.updateProfile({ name }),
    onSuccess: async () => {
      await Promise.all([
        authClient.getSession(),
        queryClient.invalidateQueries({ queryKey: workspaceKeys.me() }),
      ])
    },
    meta: {
      getErrorMessage: (error: ApiError) =>
        error.detail || error.title || "Failed to update name",
    },
  })

  return {
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
