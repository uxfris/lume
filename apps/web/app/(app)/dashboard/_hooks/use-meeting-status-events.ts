"use client"

import { meetingApi } from "@workspace/api-client"
import type { Meeting } from "@workspace/types"
import {
  dbMeetingStatusToUiStatus,
  isTerminalUiMeetingStatus,
} from "@/lib/meeting-status"
import { useEffect, useMemo, useRef } from "react"

type ProcessingEventPayload = {
  meetingStatus?: string | null
  stage?: string
  status?: "STARTED" | "SUCCEEDED" | "FAILED"
}

type UseMeetingStatusEventsOptions = {
  meetings: Array<{ id: string; status: Meeting["status"] }>
  /** Always subscribe to these IDs (live strip, scheduled bots, etc.). */
  watchMeetingIds?: string[]
  onMeetingUpdate: (
    meetingId: string,
    meeting: Meeting | Partial<Meeting>
  ) => void
  /** Called when the raw DB status changes (e.g. refresh live-meeting strip). */
  onDbStatusChange?: (meetingId: string, dbStatus: string) => void
}

export function useMeetingStatusEvents({
  meetings,
  watchMeetingIds = [],
  onMeetingUpdate,
  onDbStatusChange,
}: UseMeetingStatusEventsOptions) {
  const onMeetingUpdateRef = useRef(onMeetingUpdate)
  const onDbStatusChangeRef = useRef(onDbStatusChange)

  onMeetingUpdateRef.current = onMeetingUpdate
  onDbStatusChangeRef.current = onDbStatusChange

  const watchIdsKey = useMemo(
    () => [...watchMeetingIds].sort().join(","),
    [watchMeetingIds]
  )

  const subscribedIdsKey = useMemo(() => {
    const fromMeetings = meetings
      .filter((m) => !isTerminalUiMeetingStatus(m.status))
      .map((m) => m.id)
    const watched = watchIdsKey ? watchIdsKey.split(",") : []
    return [...new Set([...fromMeetings, ...watched])].sort().join(",")
  }, [meetings, watchIdsKey])

  useEffect(() => {
    if (!subscribedIdsKey) return

    const meetingIds = subscribedIdsKey.split(",")
    const baseApiUrl = "/api"

    const streams = meetingIds.map((meetingId) => {
      const source = new EventSource(
        `${baseApiUrl}/meetings/${meetingId}/events`
      )

      source.addEventListener("processing.event", (event) => {
        const payload = JSON.parse(
          (event as MessageEvent).data
        ) as ProcessingEventPayload

        if (!payload.meetingStatus) return

        const dbStatus = payload.meetingStatus
        onDbStatusChangeRef.current?.(meetingId, dbStatus)

        const uiStatus = dbMeetingStatusToUiStatus(dbStatus)

        if (uiStatus === "processed") {
          void meetingApi.getMeeting(meetingId).then((full) => {
            onMeetingUpdateRef.current(meetingId, full)
          })
          return
        }

        onMeetingUpdateRef.current(meetingId, { status: uiStatus })
      })

      return source
    })

    return () => {
      for (const source of streams) source.close()
    }
  }, [subscribedIdsKey])
}
