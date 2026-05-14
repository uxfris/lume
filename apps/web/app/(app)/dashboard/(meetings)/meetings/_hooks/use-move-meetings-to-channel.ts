"use client"

import { useState } from "react"
import { Channel, Meeting } from "@workspace/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"
import { channelApi } from "@workspace/api-client"

export function useMoveMeetingsToChannel(meetingIds: string[]) {
  const router = useRouter()
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(false)

  const moveMeetings = async () => {
    if (!selectedChannel) {
      toast.error("No channel selected")
      return
    }

    try {
      setLoading(true)

      await channelApi.addMeetingsToChannel(selectedChannel.id, meetingIds)
      toast.success("Meetings moved successfully")
      router.push(routes.dashboard.meetings.channel(selectedChannel.id))
    } catch (error) {
      console.log(error)
      toast.error("Failed to move meetings")
    } finally {
      setLoading(false)
    }
  }

  return {
    selectedChannel,
    setSelectedChannel,
    moveMeetings,
    loading,
  }
}
