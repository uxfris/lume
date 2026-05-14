"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { channelApi, meetingApi } from "@workspace/api-client"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useAddMeetingsToChannel({
  channelId,
  onOpenChange,
}: {
  channelId: string
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()

  const { workspaceId } = useCurrentWorkspace()

  const [search, setSearch] = useState("")
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([])
  const [isAddLoading, setIsAddLoading] = useState(false)

  const {
    data: meetings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["meetings", workspaceId],
    queryFn: () => meetingApi.getMeetingsList(),
    staleTime: 300_000,
  })

  const filteredMeetings = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return meetings
    }

    return meetings.filter((meeting) =>
      meeting.title?.toLowerCase().includes(query)
    )
  }, [meetings, search])

  const toggleMeeting = (meetingId: string) => {
    setSelectedMeetings((prev) =>
      prev.includes(meetingId)
        ? prev.filter((id) => id !== meetingId)
        : [...prev, meetingId]
    )
  }

  const addMettingstoChannel = async () => {
    try {
      setIsAddLoading(true)
      await channelApi.addMeetingsToChannel(channelId, selectedMeetings)
      router.refresh()
      toast.success(
        `meeting${selectedMeetings.length !== 1 ? "s" : ""} moved successfully`
      )
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to move meetings")
    } finally {
      setIsAddLoading(false)
    }
  }

  return {
    search,
    setSearch,
    isLoading,
    isError,
    filteredMeetings,
    toggleMeeting,
    selectedMeetings,
    addMettingstoChannel,
    isAddLoading,
  }
}
