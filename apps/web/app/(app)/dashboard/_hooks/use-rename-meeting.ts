import { toast } from "sonner"
import { useState } from "react"
import { meetingApi } from "@workspace/api-client"
import { useRouter } from "next/navigation"

export function useRenameMeeting({
  meetingTitle,
  meetingId,
  onOpenChange,
}: {
  meetingTitle: string
  meetingId: string
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(meetingTitle)

  const renameMeeting = async () => {
    try {
      setLoading(true)
      await meetingApi.updateMeeting(meetingId, { title: title })
      toast.success("Meeting renamed successfully")
      onOpenChange(false)

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    title,
    setTitle,
    renameMeeting,
  }
}
