"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { AttendeeAvatar } from "@/components/attendee-avatar"
import { SanitizedHtml } from "@/lib/sanitized-html"
import { Meeting } from "@workspace/types"
import { MeetingItemMenu } from "./meeting-item-menu"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { useMeetingSelection } from "../../(meetings)/meetings/_stores/meeting-selection-store"

type MeetingCardProps = {
  meeting: Meeting
  selectionMode?: boolean
}

export function MeetingCard({ meeting, selectionMode }: MeetingCardProps) {
  const isAnalyzing = meeting.status !== "processed"

  const selectedIds = useMeetingSelection((s) => s.selectedIds)
  const toggleSelect = useMeetingSelection((s) => s.toggleSelect)

  const isChecked = selectedIds.includes(meeting.id)

  return (
    <Card
      onClick={
        selectionMode
          ? () => {
              toggleSelect(meeting.id)
            }
          : undefined
      }
      className={cn(
        "group/meeting h-full p-0",
        selectionMode && "cursor-pointer",
        !selectionMode && "hover:bg-secondary"
      )}
    >
      <CardContent className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          {selectionMode ? (
            <Checkbox
              className="h-7 w-7 cursor-pointer"
              checked={isChecked}
              // onPointerDown={(e) => {
              //     e.stopPropagation()
              // }}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => toggleSelect(meeting.id)}
            />
          ) : (
            <Badge
              className={cn(
                isAnalyzing ? "bg-accent-2" : "bg-accent-3",
                "rounded-[2px] px-2 pt-3.5 pb-3 text-[10px] font-semibold text-primary uppercase dark:text-slate-200"
              )}
            >
              <SanitizedHtml html={meeting.status} />
            </Badge>
          )}
          <span className="text-xs font-medium text-muted-foreground">
            <SanitizedHtml
              html={`${meeting.timestamp} • ${meeting.duration}`}
            />
          </span>
        </div>
        <div className={cn("flex-1", isAnalyzing ? "space-y-4" : "space-y-2")}>
          <h3 className="line-clamp-1 text-base font-semibold">
            <SanitizedHtml html={meeting.title} />
          </h3>
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <span className="relative flex">
                <span className="absolute size-1.5 animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative size-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-primary uppercase">
                Generating Summary...
              </span>
            </div>
          ) : (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              <SanitizedHtml html={meeting.summary} />
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <AttendeeAvatar
            attendees={meeting.attendees}
            extra={meeting.extraAttendees}
          />
          {!selectionMode && <MeetingItemMenu meeting={meeting} />}
        </div>
      </CardContent>
    </Card>
  )
}
