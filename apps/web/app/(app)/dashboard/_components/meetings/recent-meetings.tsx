"use client"

import MeetingItem from "./meeting-item"
import { cn } from "@workspace/ui/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { LiveMeetings } from "./live-meetings"
import { LiveMeeting, Meeting } from "@workspace/types"
import { useInfiniteScroll } from "../../_hooks/use-infinite-scroll"
import { meetingApi } from "@workspace/api-client"

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-[-0.4px]">
          Recent Meetings
        </h2>
      </div>
      <LiveMeetings meetings={liveMeetings} />

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
