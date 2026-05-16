"use client"

import type { ReactNode } from "react"
import { MeetingPlaybackProvider } from "./meeting-playback-provider"

export function MeetingPlaybackShell({
  meetingId,
  children,
}: {
  meetingId: string
  children: ReactNode
}) {
  return (
    <MeetingPlaybackProvider meetingId={meetingId}>
      {children}
    </MeetingPlaybackProvider>
  )
}
