"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { channelApi } from "@workspace/api-client"
import { channelKeys } from "../../_lib/channel.keys"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export type DeleteChannelPayload = {
  id: string
}

type UseDeleteChannelMutationReturn = {
  deleteChannel: (payload: DeleteChannelPayload) => void
  deleteChannelAsync: (payload: DeleteChannelPayload) => Promise<any>
  loading: boolean
}

export function useDeleteChannelMutation({
  isFromChannel,
  onOpenChange,
}: {
  isFromChannel: boolean
  onOpenChange: (open: boolean) => void
  }): UseDeleteChannelMutationReturn {
    const { workspaceId } = useCurrentWorkspace()
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, ...payload }: DeleteChannelPayload) => {
      return channelApi.deleteChannel(id)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: channelKeys.all(workspaceId),
      })

      toast.success("Channel deleted successfully")

      onOpenChange(false)

      if (isFromChannel) {
        router.push(routes.dashboard.meetings.root)
      }
    },

    onError: (error) => {
      toast.error(error.message)
    },
  })

  return {
    deleteChannel: mutation.mutate,
    deleteChannelAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
