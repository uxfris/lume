"use client"

import Link from "next/link"
import { Meeting } from "@workspace/types"
import { MeetingCard } from "./meeting-card"
import { routes } from "@/lib/routes"

type MeetingItemProps = {
  meeting: Meeting
  selectionMode?: boolean
}

export default function MeetingItem({
  meeting,
  selectionMode,
}: MeetingItemProps) {
  if (selectionMode) {
    return <MeetingCard meeting={meeting} selectionMode={selectionMode} />
  }
  return (
    <Link href={routes.meeting(meeting.id)} className="h-full">
      <MeetingCard meeting={meeting} selectionMode={selectionMode} />
    </Link>
  )
}
