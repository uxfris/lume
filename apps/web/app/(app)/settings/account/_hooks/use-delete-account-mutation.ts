import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query"

import { accountApi } from "@workspace/api-client"
import { accountDeletionKeys } from "./use-account-deletion-context"
import type { ApiError } from "@workspace/api-client"
import type {
  AccountDeletionReason,
  DeleteAccountBody,
  ScheduleAccountDeletionResponse,
} from "@workspace/types"

export function useDeleteAccountMutation(): UseMutationResult<
  ScheduleAccountDeletionResponse,
  ApiError,
  DeleteAccountBody
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: DeleteAccountBody) =>
      accountApi.scheduleAccountDeletion(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: accountDeletionKeys.context,
      })
    },
    meta: {
      getErrorMessage: (error: ApiError) => {
        if (error.detail?.includes("EMAIL_MISMATCH")) {
          return "Email address does not match your account."
        }

        if (error.detail?.includes("WORKSPACE_NAME_MISMATCH")) {
          return "Workspace name does not match."
        }

        if (error.detail?.includes("ALREADY_SCHEDULED")) {
          return "Account deletion is already scheduled."
        }

        return (
          error.detail || error.title || "Failed to schedule account deletion"
        )
      },
    },
  })
}

export type { AccountDeletionReason }
