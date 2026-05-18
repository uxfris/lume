"use client"

import MeetingItem from "./meeting-item"
import { cn } from "@workspace/ui/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { LiveMeetings } from "./live-meetings"
import { LiveMeeting, Meeting } from "@workspace/types"
import { useInfiniteScroll } from "../../_hooks/use-infinite-scroll"
import { useMeetingStatusEvents } from "../../_hooks/use-meeting-status-events"
import { meetingApi } from "@workspace/api-client"
import { useCallback, useEffect, useState } from "react"

export function RecentMeetings({
  initialMeetings,
  initialCursor,
  liveMeetings,
}: {
  initialMeetings: Meeting[]
  initialCursor: string | null
  liveMeetings: LiveMeeting[]
}) {
  const {
    items: meetings,
    setItems,
    loading,
    hasMore,
    observerRef,
  } = useInfiniteScroll({
    initialItems: initialMeetings,
    initialCursor,
    fetcher: async (cursor) => {
      const res = await meetingApi.getMeetings({
        cursor,
        limit: 20,
      })

      return {
        items: res.meetings,
        nextCursor: res.nextCursor,
      }
    },
  })

  const [liveMeetingsState, setLiveMeetingsState] =
    useState<LiveMeeting[]>(liveMeetings)

  useEffect(() => {
    setLiveMeetingsState(liveMeetings)
  }, [liveMeetings])

  const handleMeetingUpdate = useCallback(
    (meetingId: string, update: Meeting | Partial<Meeting>) => {
      setItems((prev) =>
        prev.map((m) =>
          m.id === meetingId ? ({ ...m, ...update } as Meeting) : m
        )
      )
    },
    [setItems]
  )

  const handleDbStatusChange = useCallback(
    (meetingId: string, dbStatus: string) => {
      if (dbStatus === "LIVE") {
        void meetingApi.getLiveMeetings().then(setLiveMeetingsState)
        return
      }
      if (dbStatus !== "LIVE") {
        setLiveMeetingsState((prev) => prev.filter((m) => m.id !== meetingId))
      }
    },
    []
  )

  useMeetingStatusEvents({
    meetings,
    onMeetingUpdate: handleMeetingUpdate,
    onDbStatusChange: handleDbStatusChange,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-[-0.4px]">
          Recent Meetings
        </h2>
      </div>
      <LiveMeetings meetings={liveMeetingsState} />

      {meetings.length === 0 ? (
        <EmptyState
          title="No recent activity yet"
          description="Your meeting summaries and section items will appear here once your first session is processed."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
            {meetings.map((meeting, index) => {
              const isFullWidth = index >= 2 //first 2 = half, rest full
              return (
                <div
                  key={meeting.id}
                  className={cn(isFullWidth && "md:col-span-2")}
                >
                  <MeetingItem meeting={meeting} />
                </div>
              )
            })}
          </div>
          {hasMore && (
            <div ref={observerRef} className="flex justify-center py-10">
              {loading && (
                <p className="text-sm text-muted-foreground">
                  Loading more meetings...
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
