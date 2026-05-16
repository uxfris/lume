"use client"

import { meetingApi } from "@workspace/api-client"
import type { TiptapJSONContent } from "@workspace/types"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function useUpdateMeetingSummaryMutation(meetingId: string) {
  const router = useRouter()

  return useMutation({
    mutationFn: (document: TiptapJSONContent) =>
      meetingApi.updateMeetingSummary(meetingId, { document }),
    onSuccess: () => {
      router.refresh()
    },
    onError: () => {
      toast.error("Could not save notes. Your changes are kept in this tab.")
    },
  })
}
