import { useMutation, type UseMutationResult } from "@tanstack/react-query"

import { accountApi } from "@workspace/api-client"
import type { ApiError } from "@workspace/api-client"
import type { AccountDeletionReason, DeleteAccountBody } from "@workspace/types"

type DeleteAccountResponse = Awaited<
  ReturnType<typeof accountApi.deleteAccount>
>

export function useDeleteAccountMutation(): UseMutationResult<
  DeleteAccountResponse,
  ApiError,
  DeleteAccountBody
> {
  return useMutation({
    mutationFn: (body: DeleteAccountBody) => accountApi.deleteAccount(body),

    meta: {
      getErrorMessage: (error: ApiError) => {
        if (error.detail?.includes("EMAIL_MISMATCH")) {
          return "Email address does not match your account."
        }

        if (error.detail?.includes("WORKSPACE_NAME_MISMATCH")) {
          return "Workspace name does not match."
        }

        return error.detail || error.title || "Failed to delete account"
      },
    },
  })
}

export type { AccountDeletionReason }
