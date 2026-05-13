import { meetingApi } from "@workspace/api-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function useDeleteMeeting({
  meetingId,
  onOpenChange,
}: {
  meetingId: string
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const deleteMeeting = async () => {
    try {
      setLoading(true)
      await meetingApi.deleteMeeting(meetingId)
      toast.success("Meeting deleted successfully")
      onOpenChange(false)

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteMeeting,
    loading,
  }
}
