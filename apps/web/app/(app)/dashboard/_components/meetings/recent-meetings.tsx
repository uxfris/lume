"use client"

import MeetingItem from "./meeting-item"
import { cn } from "@workspace/ui/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { LiveMeetings } from "./live-meetings"
import { LiveMeeting, Meeting } from "@workspace/types"
import { useInfiniteScroll } from "../../_hooks/use-infinite-scroll"
import { useMeetingStatusEvents } from "../../_hooks/use-meeting-status-events"
import { meetingApi } from "@workspace/api-client"
import { usePendingBotMeetingIds } from "../../_stores/pending-bot-meeting-ids-store"
import { isTerminalUiMeetingStatus } from "@/lib/meeting-status"
import { useCallback, useEffect, useMemo, useState } from "react"

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

  const pendingBotMeetingIds = usePendingBotMeetingIds((s) => s.ids)
  const removePendingBotMeeting = usePendingBotMeetingIds((s) => s.remove)

  const liveMeetingIds = useMemo(
    () => liveMeetingsState.map((m) => m.id),
    [liveMeetingsState]
  )

  const watchMeetingIds = useMemo(
    () => [...new Set([...liveMeetingIds, ...pendingBotMeetingIds])],
    [liveMeetingIds, pendingBotMeetingIds]
  )

  useEffect(() => {
    setLiveMeetingsState(liveMeetings)
  }, [liveMeetings])

  // Fallback for bots started outside this session (e.g. calendar dispatch).
  useEffect(() => {
    const refreshLive = () => {
      void meetingApi.getLiveMeetings().then(setLiveMeetingsState)
    }
    refreshLive()
    const interval = setInterval(refreshLive, 20_000)
    return () => clearInterval(interval)
  }, [])

  const handleMeetingUpdate = useCallback(
    (meetingId: string, update: Meeting | Partial<Meeting>) => {
      const nextStatus =
        "status" in update && update.status != null ? update.status : undefined

      if (nextStatus && isTerminalUiMeetingStatus(nextStatus)) {
        removePendingBotMeeting(meetingId)
      }

      setItems((prev) => {
        const existing = prev.find((m) => m.id === meetingId)
        if (existing) {
          return prev.map((m) =>
            m.id === meetingId ? ({ ...m, ...update } as Meeting) : m
          )
        }
        if ("createdAt" in update) {
          return [{ ...update } as Meeting, ...prev]
        }
        return prev
      })
    },
    [setItems, removePendingBotMeeting]
  )

  const addOrUpdateRecentMeeting = useCallback(
    (meetingId: string) => {
      void meetingApi.getMeeting(meetingId).then((full) => {
        setItems((prev) => {
          const existing = prev.find((m) => m.id === meetingId)
          if (existing) {
            return prev.map((m) =>
              m.id === meetingId ? ({ ...m, ...full } as Meeting) : m
            )
          }
          return [full, ...prev]
        })
      })
    },
    [setItems]
  )

  const handleDbStatusChange = useCallback(
    (meetingId: string, dbStatus: string) => {
      if (dbStatus === "LIVE") {
        void meetingApi.getLiveMeetings().then(setLiveMeetingsState)
        return
      }

      setLiveMeetingsState((prev) => prev.filter((m) => m.id !== meetingId))

      // LIVE meetings are excluded from the list API; insert once processing starts.
      if (dbStatus !== "SCHEDULED") {
        addOrUpdateRecentMeeting(meetingId)
      }
    },
    [addOrUpdateRecentMeeting]
  )

  useMeetingStatusEvents({
    meetings,
    watchMeetingIds,
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
