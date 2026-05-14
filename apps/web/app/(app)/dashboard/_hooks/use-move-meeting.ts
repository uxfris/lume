"use client"

import { channelApi } from "@workspace/api-client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Meeting } from "@workspace/types"
import { routes } from "@/lib/routes"
import { channelKeys } from "../(meetings)/meetings/channel/_lib/channel.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export const NO_CHANNEL = "no-channel"

export function useMoveMeeting({
  meeting,
  onOpenChange,
}: {
  meeting: Meeting
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()

  const { workspaceId } = useCurrentWorkspace()

  const [moveLoading, setMoveLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    meeting.channelId ?? NO_CHANNEL
  )

  const {
    data: channels = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: channelKeys.all(workspaceId),
    queryFn: () => channelApi.getChannels(),
    staleTime: 300_000,
  })

  const query = search.trim().toLowerCase()

  const filteredChannels = !query
    ? channels
    : channels.filter((channel) => channel.name.toLowerCase().includes(query))

  const currentChannelId = meeting.channelId ?? NO_CHANNEL

  const moveMeeting = async () => {
    try {
      setMoveLoading(true)
      if (selectedChannelId === NO_CHANNEL && meeting.channelId) {
        await channelApi.removeMeetingsFromChannel(meeting.channelId, [
          meeting.id,
        ])
        router.refresh()
      } else {
        await channelApi.addMeetingsToChannel(selectedChannelId, [meeting.id])
        router.push(routes.dashboard.meetings.channel(selectedChannelId))
      }
      toast.success("Meeting moved successfully")
      onOpenChange(false)
    } catch {
      toast.error("Failed to move meeting")
    } finally {
      setMoveLoading(false)
    }
  }

  return {
    search,
    setSearch,
    selectedChannelId,
    setSelectedChannelId,
    currentChannelId,
    isLoading,
    isError,
    filteredChannels,
    moveMeeting,
    moveLoading,
  }
}
