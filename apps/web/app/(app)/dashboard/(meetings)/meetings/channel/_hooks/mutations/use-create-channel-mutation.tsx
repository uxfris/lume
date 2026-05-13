"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { channelApi } from "@workspace/api-client"
import { channelKeys } from "../../_lib/channel-query-keys"
import { routes } from "@/lib/routes"

export type CreateChannelPayload = {
  name: string
  type: "PUBLIC" | "PRIVATE"
}

type UseCreateChannelMutationReturn = {
  createChannel: (payload: CreateChannelPayload) => void
  createChannelAsync: (payload: CreateChannelPayload) => Promise<any>
  loading: boolean
}

export function useCreateChannelMutation(
  onOpenChange: (open: boolean) => void
): UseCreateChannelMutationReturn {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: CreateChannelPayload) => {
      if (!payload.name.trim()) {
        throw new Error("Channel name is required")
      }

      return channelApi.createChannel(payload)
    },

    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: channelKeys.all,
      })

      toast.success("Channel created successfully")

      onOpenChange(false)

      router.push(routes.dashboard.meetings.channel(created.id))
    },

    onError: (error) => {
      toast.error(error.message)
    },
  })

  return {
    createChannel: mutation.mutate,
    createChannelAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
