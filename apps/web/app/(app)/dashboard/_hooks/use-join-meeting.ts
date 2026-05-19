import z from "zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { botsApi } from "@workspace/api-client"
import { joinMeetingSchema } from "../_components/live-sync/join-meeting-schema"
import { usePendingBotMeetingIds } from "../_stores/pending-bot-meeting-ids-store"

type JoinMeetingPayload = z.infer<typeof joinMeetingSchema>

type UseJoinMeetingReturn = {
  form: UseFormReturn<JoinMeetingPayload>
  joinMeeting: (payload: JoinMeetingPayload) => Promise<string>
  loading: boolean
  error: Error | null
}

export function useJoinMeeting({
  open,
  meetingUrl,
  onSuccess,
}: {
  open: boolean
  meetingUrl: string | undefined
  onSuccess: (meetingUrl: string) => void
}): UseJoinMeetingReturn {
  const trackPendingBotMeeting = usePendingBotMeetingIds((s) => s.add)

  const form = useForm<JoinMeetingPayload>({
    resolver: zodResolver(joinMeetingSchema),
    defaultValues: {
      url: meetingUrl ?? "",
      name: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        url: meetingUrl ?? "",
        name: "",
      })
    } else {
      form.reset()
    }
  }, [open, meetingUrl, form])

  const mutation = useMutation({
    mutationFn: async (data: JoinMeetingPayload) => {
      const finalUrl = meetingUrl ?? data.url

      const result = await botsApi.startBotMeeting({
        meetingUrl: finalUrl,
        title: data.name,
      })

      trackPendingBotMeeting(result.meetingId)

      return finalUrl
    },

    onSuccess: (finalUrl) => {
      onSuccess(finalUrl)
    },
  })

  return {
    form,
    joinMeeting: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  }
}
