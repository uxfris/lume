"use client"

import { routes } from "@/lib/routes"
import { useMeetingStatusEvents } from "@/app/(app)/dashboard/_hooks/use-meeting-status-events"
import { isTerminalUiMeetingStatus } from "@/lib/meeting-status"
import { DangerTriangle } from "@solar-icons/react"
import { Meeting } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { MeetingDocumentActionItem } from "./meeting-document-action-item"
import { MeetingDocumentTranscript } from "./meeting-document-transcript"
import { MeetingMediaPlayerBar } from "./meeting-media-player-bar"
import { MeetingPlaybackShell } from "./meeting-playback-shell"
import { MeetingEditor } from "./editor/meeting-editor"

const LOADING_MESSAGE: Record<
  Exclude<Meeting["status"], "processed" | "failed">,
  string
> = {
  transcribing: "Transcribing your meeting…",
  analyzing: "Generating summary…",
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

function MeetingDocumentLoading({
  status,
}: {
  status: Exclude<Meeting["status"], "processed" | "failed">
}) {
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

function MeetingDocumentFailed({ source }: { source: Meeting["source"] }) {
  const description =
    source === "upload"
      ? "We couldn't generate a transcript or summary for this file. Try uploading it again."
      : "We couldn't generate a transcript or summary for this recording."

  return (
    <div
      className="flex min-h-48 flex-col items-center justify-center gap-3 py-16 text-center"
      role="alert"
    >
      <DangerTriangle size={32} className="text-destructive" aria-hidden />
      <p className="text-sm font-medium text-foreground">Processing failed</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {source === "upload" ? (
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href={routes.dashboard.uploads}>Go to uploads</Link>
        </Button>
      ) : null}
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

  const { status, source } = meeting

  if (status === "failed") {
    return <MeetingDocumentFailed source={source} />
  }

  if (!isTerminalUiMeetingStatus(status)) {
    return <MeetingDocumentLoading status={status} />
  }

  return (
    <>
      <div className="space-y-6">
        <MeetingEditor meeting={meeting} />
        <MeetingDocumentActionItem
          meetingId={meeting.id}
          meetingTitle={meeting.title}
        />
      </div>
      <MeetingPlaybackShell meetingId={meeting.id}>
        <MeetingDocumentTranscript />
        <MeetingMediaPlayerBar />
      </MeetingPlaybackShell>
    </>
  )
}
