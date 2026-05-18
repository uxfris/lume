import { UseMutationResult, useMutation } from "@tanstack/react-query"
import { accountApi } from "@workspace/api-client"
import type { ApiError } from "@workspace/api-client"
import type { CancelAccountDeletionBody } from "@workspace/types"

type CancelAccountDeletionResponse = Awaited<
  ReturnType<typeof accountApi.cancelAccountDeletion>
>

export function useCancelAccountDeletionMutation(): UseMutationResult<
  CancelAccountDeletionResponse,
  ApiError,
  CancelAccountDeletionBody
> {
  return useMutation({
    mutationFn: (body: CancelAccountDeletionBody) =>
      accountApi.cancelAccountDeletion(body),
    meta: {
      getErrorMessage: (error: ApiError) =>
        error.detail || error.title || "Failed to cancel account deletion",
    },
  })
}
