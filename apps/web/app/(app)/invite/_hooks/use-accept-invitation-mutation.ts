import {
  useMutation,
  useQueryClient,
  type UseMutateFunction,
} from "@tanstack/react-query"
import type { GetMeResponse } from "@workspace/types"
import { workspaceApi } from "@workspace/api-client"
import { workspaceKeys } from "@/app/(app)/settings/workspace/_lib/workspace.keys"

type AcceptInvitationResult = {
  workspaceId: string
  role: string
  workspaceName: string | null
}

export type AcceptInvitationState = {
  acceptInvite: UseMutateFunction<AcceptInvitationResult, unknown, string>
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  error: unknown
}

export function useAcceptInvitationMutation(): AcceptInvitationState {
  const queryClient = useQueryClient()

  const mutation = useMutation<AcceptInvitationResult, unknown, string>({
    mutationFn: async (token) => {
      const result = await workspaceApi.acceptInvitation(token)

      await queryClient.invalidateQueries({ queryKey: workspaceKeys.all })

      const me = await queryClient.fetchQuery<GetMeResponse>({
        queryKey: workspaceKeys.me(),
        queryFn: () => workspaceApi.getMe(),
      })

      const workspace = me.workspaces.find(
        (item) => item.id === result.workspaceId
      )

      return {
        workspaceId: result.workspaceId,
        role: result.role,
        workspaceName: workspace?.name ?? null,
      }
    },
  })

  return {
    acceptInvite: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}
