import { channelApi } from "@workspace/api-client"
import { Meeting } from "@workspace/types"
import { router } from "better-auth/api"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useMeetingSelection } from "../_stores/meeting-selection-store"

export function removeMeetingsFromChannel({
  selectedMeetingIds,
}: {
  selectedMeetingIds: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const params = useParams()

  const clearSelection = useMeetingSelection((s) => s.clearSelection)
  const setSelectionMode = useMeetingSelection((s) => s.setSelectionMode)

  const [loading, setLoading] = useState(false)

  const removeMeetings = async () => {
    const channelId = typeof params.id === "string" ? params.id : undefined

    if (!channelId) {
      return
    }
    try {
      setLoading(true)
      await channelApi.removeMeetingsFromChannel(channelId, selectedMeetingIds)
      toast.success(
        `Meeting${selectedMeetingIds.length > 1 ? "s" : ""} removed from channel`
      )
      clearSelection()
      setSelectionMode(false)

      router.refresh()
    } catch (error) {
      toast.error(
        `Failed to remove meeting${selectedMeetingIds.length > 1 ? "s" : ""} from channel`
      )
    } finally {
      setLoading(false)
    }
  }
  return {
    open,
    setOpen,
    loading,
    removeMeetings,
  }
}
