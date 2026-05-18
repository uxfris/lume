import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadsApi, workspaceApi } from "@workspace/api-client"
import type { ApiError } from "@workspace/api-client"
import type { WorkspaceSummary } from "@workspace/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { workspaceKeys } from "../../_lib/workspace.keys"

const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

type UpdateWorkspaceAvatarState = {
  update: (file: File) => Promise<WorkspaceSummary>
  isPending: boolean
}

export function useUpdateWorkspaceAvatarMutation(): UpdateWorkspaceAvatarState {
  const queryClient = useQueryClient()
  const { workspaceId } = useCurrentWorkspace()

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      if (!workspaceId) throw new Error("No workspace selected")

      if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
        throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.")
      }
      if (file.size > MAX_AVATAR_BYTES) {
        throw new Error("Image must be 5 MB or smaller.")
      }

      const presigned = await workspaceApi.presignAvatar(workspaceId, {
        contentType: file.type as
          | "image/jpeg"
          | "image/png"
          | "image/webp"
          | "image/gif",
        fileSize: file.size,
      })

      await uploadsApi.uploadToSignedUrl(presigned.uploadUrl, file)
      return workspaceApi.completeAvatar(workspaceId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.me() })
    },
    meta: {
      getErrorMessage: (error: unknown) => {
        if (error instanceof Error && error.message) return error.message
        const apiError = error as ApiError
        return (
          apiError.detail || apiError.title || "Failed to update workspace avatar"
        )
      },
    },
  })

  return {
    update: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
