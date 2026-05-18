"use client"

import { Meeting } from "@workspace/types"
import MeetingItem from "../../../_components/meetings/meeting-item"
import { useMeetingSelection } from "../_stores/meeting-selection-store"
import { cn } from "@workspace/ui/lib/utils"
import { useMeetingView } from "../_stores/meeting-view-store"
import { useInfiniteScroll } from "../../../_hooks/use-infinite-scroll"
import { meetingApi } from "@workspace/api-client"
import { useCallback, useMemo } from "react"
import { useMeetingStatusEvents } from "../../../_hooks/use-meeting-status-events"
import { useMeetingListSearch } from "../_stores/meeting-list-search-store"
import { useMeetingListHostFilter } from "../_stores/meeting-list-host-filter-store"
import { filterMeetingsByQuery } from "../_lib/filter-meetings-by-query"
import { filterMeetingsByHosts } from "../_lib/filter-meetings-by-hosts"
import { useDebounce } from "@workspace/ui/hooks/use-debounce"
import { useMeetingListParticipantFilter } from "../_stores/meeting-list-participant-filter-store"
import { filterMeetingsByParticipants } from "../_lib/filter-meetings-by-participants"
import { useMeetingListTimeFilter } from "../_stores/meeting-list-time-filter-store"
import { useMeetingListDurationFilter } from "../_stores/meeting-list-duration-filter-store"
import { useMeetingListSourceFilter } from "../_stores/meeting-list-source-filter-store"
import { filterMeetingsByTime } from "../_lib/filter-meetings-by-time"
import { filterMeetingsByDuration } from "../_lib/filter-meetings-by-duration"
import { filterMeetingsBySources } from "../_lib/filter-meetings-by-sources"

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

  useMeetingStatusEvents({
    meetings,
    onMeetingUpdate: handleMeetingUpdate,
  })

  const searchQuery = useMeetingListSearch((s) => s.searchQuery)

  const debouncedQuery = useDebounce(searchQuery, 350)

  const selectedHostIds = useMeetingListHostFilter((s) => s.selectedHostIds)

  const selectedParticipantIds = useMeetingListParticipantFilter(
    (s) => s.selectedParticipantIds
  )

  const timePreset = useMeetingListTimeFilter((s) => s.preset)

  const customTimeRange = useMeetingListTimeFilter((s) => s.customRange)

  const durationPreset = useMeetingListDurationFilter((s) => s.preset)

  const selectedSources = useMeetingListSourceFilter((s) => s.selectedSources)

  const queryFiltered = useMemo(
    () => filterMeetingsByQuery(meetings, debouncedQuery),
    [meetings, debouncedQuery]
  )

  const hostFiltered = useMemo(
    () => filterMeetingsByHosts(queryFiltered, selectedHostIds),
    [queryFiltered, selectedHostIds]
  )

  const participantFiltered = useMemo(
    () => filterMeetingsByParticipants(hostFiltered, selectedParticipantIds),
    [hostFiltered, selectedParticipantIds]
  )

  const timeFiltered = useMemo(
    () =>
      filterMeetingsByTime(participantFiltered, timePreset, customTimeRange),
    [participantFiltered, timePreset, customTimeRange]
  )

  const durationFiltered = useMemo(
    () => filterMeetingsByDuration(timeFiltered, durationPreset),
    [timeFiltered, durationPreset]
  )

  const visibleMeetings = useMemo(
    () => filterMeetingsBySources(durationFiltered, selectedSources),
    [durationFiltered, selectedSources]
  )

  const trimmedQuery = debouncedQuery.trim()

  const hasSearch = trimmedQuery.length > 0
  const hasHostFilter = selectedHostIds.length > 0
  const hasParticipantFilter = selectedParticipantIds.length > 0
  const hasTimeFilter = timePreset !== "any-time"
  const hasDurationFilter = durationPreset !== "any-duration"
  const hasSourceFilter = selectedSources.length > 0

  const hasActiveFilters =
    hasSearch ||
    hasHostFilter ||
    hasParticipantFilter ||
    hasTimeFilter ||
    hasDurationFilter ||
    hasSourceFilter

  const activeFilters: string[] = []

  if (hasHostFilter) activeFilters.push("hosts")
  if (hasParticipantFilter) activeFilters.push("participants")
  if (hasTimeFilter) activeFilters.push("time")
  if (hasDurationFilter) activeFilters.push("duration")
  if (hasSourceFilter) activeFilters.push("sources")

  const showEmptyState = visibleMeetings.length === 0

  const emptyMessage = useMemo(() => {
    if (!showEmptyState) return null

    if (hasSearch && activeFilters.length === 0) {
      return `No meetings match "${trimmedQuery}".`
    }

    if (hasSearch) {
      return `No meetings match "${trimmedQuery}" with the current filters applied.`
    }

    if (hasActiveFilters) {
      return `No meetings match the selected ${activeFilters.join(
        ", "
      )} filters.`
    }

    return "No meetings available yet."
  }, [showEmptyState, hasSearch, hasActiveFilters, activeFilters, trimmedQuery])

  return (
    <>
      {emptyMessage && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
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
