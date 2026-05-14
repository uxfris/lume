"use client"

import { Meeting } from "@workspace/types"
import MeetingItem from "../../../_components/meetings/meeting-item"
import { useMeetingSelection } from "../_stores/meeting-selection-store"
import { cn } from "@workspace/ui/lib/utils"
import { useMeetingView } from "../_stores/meeting-view-store"
import { useInfiniteScroll } from "../../../_hooks/use-infinite-scroll"
import { meetingApi } from "@workspace/api-client"
import { useMemo } from "react"
import { useMeetingListSearch } from "../_stores/meeting-list-search-store"
import { useMeetingListHostFilter } from "../_stores/meeting-list-host-filter-store"
import { filterMeetingsByQuery } from "../_lib/filter-meetings-by-query"
import { filterMeetingsByHosts } from "../_lib/filter-meetings-by-hosts"
import { useDebounce } from "@workspace/ui/hooks/use-debounce"

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

  const searchQuery = useMeetingListSearch((s) => s.searchQuery)

  const debouncedQuery = useDebounce(searchQuery, 350)

  const selectedHostIds = useMeetingListHostFilter((s) => s.selectedHostIds)

  const queryFiltered = useMemo(
    () => filterMeetingsByQuery(meetings, debouncedQuery),
    [meetings, debouncedQuery]
  )

  const visibleMeetings = useMemo(
    () => filterMeetingsByHosts(queryFiltered, selectedHostIds),
    [queryFiltered, selectedHostIds]
  )

  const trimmedQuery = debouncedQuery.trim()
  const showSearchEmpty =
    trimmedQuery.length > 0 && queryFiltered.length === 0
  const showHostEmpty =
    selectedHostIds.length > 0 &&
    queryFiltered.length > 0 &&
    visibleMeetings.length === 0

  return (
    <>
      {showSearchEmpty && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {`No meetings match "${trimmedQuery}". Try different keywords or load more meetings below.`}
        </p>
      )}
      {showHostEmpty && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No meetings from the selected hosts in this list. Clear the host filter
          or load more meetings.
        </p>
      )}
      <div
        className={cn(
          meetingView === "list"
            ? "flex flex-col gap-5"
            : "grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {visibleMeetings.map((meeting) => (
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
