import { meetingApi } from "@workspace/api-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useMeetingSelection } from "../_stores/meeting-selection-store"
import { Meeting } from "@workspace/types"

export function useDeleteMeetings({
  meetings,
  selectedMeetingIds,
}: {
  meetings: Meeting[]
  selectedMeetingIds: string[]
}) {
  const router = useRouter()

  const clearSelection = useMeetingSelection((s) => s.clearSelection)
  const setSelectionMode = useMeetingSelection((s) => s.setSelectionMode)

  const [loading, setLoading] = useState(false)

  const deleteMeetings = async () => {
    try {
      setLoading(true)
      await meetingApi.deleteMeetings(selectedMeetingIds)
      toast.success(
        `Meeting${selectedMeetingIds.length > 1 ? "s" : ""} deleted successfully`
      )
      clearSelection()
      setSelectionMode(false)

      router.refresh()
    } catch (error) {
      toast.error(
        `Failed to delete meeting${selectedMeetingIds.length > 1 ? "s" : ""}`
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    deleteMeetings,
  }
}
