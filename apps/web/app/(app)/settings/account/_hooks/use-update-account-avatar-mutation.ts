import { useMutation, useQueryClient } from "@tanstack/react-query"
import { accountApi, uploadsApi } from "@workspace/api-client"
import type { ApiError } from "@workspace/api-client"
import { authClient } from "@/lib/auth-client"
import { workspaceKeys } from "../../workspace/_lib/workspace.keys"
import { CurrentUser } from "@workspace/types"

const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

type updateAccountAvatarState = {
  update: (payload: File) => Promise<CurrentUser>
  isPending: boolean
}

export function useUpdateAccountAvatarMutation(): updateAccountAvatarState {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
        throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.")
      }
      if (file.size > MAX_AVATAR_BYTES) {
        throw new Error("Image must be 5 MB or smaller.")
      }

      const presigned = await accountApi.presignAvatar({
        contentType: file.type as
          | "image/jpeg"
          | "image/png"
          | "image/webp"
          | "image/gif",
        fileSize: file.size,
      })

      await uploadsApi.uploadToSignedUrl(presigned.uploadUrl, file)
      return accountApi.completeAvatar()
    },
    onSuccess: async () => {
      await Promise.all([
        authClient.getSession(),
        queryClient.invalidateQueries({ queryKey: workspaceKeys.me() }),
      ])
    },
    meta: {
      getErrorMessage: (error: unknown) => {
        if (error instanceof Error && error.message) return error.message
        const apiError = error as ApiError
        return apiError.detail || apiError.title || "Failed to update avatar"
      },
    },
  })

  return {
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
