"use client"

import { Meeting } from "@workspace/types"
import MeetingItem from "../../../_components/meetings/meeting-item"
import { useMeetingSelection } from "../_stores/meeting-selection-store"
import { cn } from "@workspace/ui/lib/utils"
import { useMeetingView } from "../_stores/meeting-view-store"
import { useInfiniteScroll } from "../../../_hooks/use-infinite-scroll"
import { meetingApi } from "@workspace/api-client"

export function MeetingView({
  initialMeetings,
  initialCursor,
}: {
  initialMeetings: Meeting[]
  initialCursor: string | null
}) {
  const selectionMode = useMeetingSelection((s) => s.selectionMode)

  const meetingView = useMeetingView((v) => v.meetingView)

  const {
    items: meetings,
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

  return (
    <>
      <div
        className={cn(
          meetingView === "list"
            ? "flex flex-col gap-5"
            : "grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {meetings.map((meeting) => (
          <MeetingItem
            key={meeting.id}
            meeting={meeting}
            selectionMode={selectionMode}
          />
        ))}
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
  )
}
