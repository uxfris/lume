"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { channelApi } from "@workspace/api-client"
import { channelKeys } from "../_lib/channel-query-keys"

export type UpdateChannelPayload = {
  id: string
  name: string
  type: "PUBLIC" | "PRIVATE"
}

type UseUpdateChannelMutationReturn = {
  updateChannel: (payload: UpdateChannelPayload) => void
  updateChannelAsync: (payload: UpdateChannelPayload) => Promise<any>
  loading: boolean
}

export function useUpdateChannelMutation(
  onOpenChange: (open: boolean) => void
): UseUpdateChannelMutationReturn {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, ...payload }: UpdateChannelPayload) => {
      if (!payload.name.trim()) {
        throw new Error("Channel name is required")
      }

      return channelApi.updateChannel(id, payload)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: channelKeys.all,
      })

      toast.success("Channel updated successfully")

      onOpenChange(false)
    },

    onError: (error) => {
      toast.error(error.message)
    },
  })

  return {
    updateChannel: mutation.mutate,
    updateChannelAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
