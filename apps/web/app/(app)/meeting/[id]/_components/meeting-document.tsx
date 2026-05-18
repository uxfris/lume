"use client"

import { Meeting } from "@workspace/types"
import { useMeetingStatusEvents } from "@/app/(app)/dashboard/_hooks/use-meeting-status-events"
import { isTerminalUiMeetingStatus } from "@/lib/meeting-status"
import { useCallback, useEffect, useState } from "react"
import { MeetingDocumentOverview } from "./meeting-document-overview"
import { MeetingDocumentTakeaway } from "./meeting-document-takeaway"
import { MeetingDocumentActionItem } from "./meeting-document-action-item"
import { MeetingDocumentTranscript } from "./meeting-document-transcript"
import { MeetingMediaPlayerBar } from "./meeting-media-player-bar"

const LOADING_MESSAGE: Record<Meeting["status"], string> = {
  transcribing: "Transcribing your meeting…",
  analyzing: "Generating summary…",
  processed: "",
  failed: "",
}

function BouncingDots() {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-primary" />
    </span>
  )
}

function MeetingDocumentLoading({ status }: { status: Meeting["status"] }) {
  return (
    <div
      className="flex min-h-48 flex-col items-center justify-center gap-3 py-16"
      role="status"
      aria-live="polite"
    >
      <BouncingDots />
      <p className="text-sm font-medium text-primary">
        {LOADING_MESSAGE[status] || "Processing your meeting…"}
      </p>
    </div>
  )
}

export function MeetingBody({ meeting: initialMeeting }: { meeting: Meeting }) {
  const [meeting, setMeeting] = useState(initialMeeting)

  useEffect(() => {
    setMeeting(initialMeeting)
  }, [initialMeeting])

  const handleMeetingUpdate = useCallback(
    (_meetingId: string, update: Meeting | Partial<Meeting>) => {
      setMeeting((prev) => ({ ...prev, ...update }))
    },
    []
  )

  useMeetingStatusEvents({
    meetings: [meeting],
    onMeetingUpdate: handleMeetingUpdate,
  })

  const isLoading = !isTerminalUiMeetingStatus(meeting.status)

  if (isLoading) {
    return <MeetingDocumentLoading status={meeting.status} />
  }

  return (
    <>
      <MeetingDocumentOverview meeting={meeting} />
      <MeetingDocumentTakeaway meeting={meeting} />
      <MeetingDocumentActionItem />
      <MeetingDocumentTranscript />
      <MeetingMediaPlayerBar />
    </>
  )
}
