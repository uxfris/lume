"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { ClockCircle } from "@solar-icons/react/ssr"
import { cn } from "@workspace/ui/lib/utils"
import { AttendeeAvatar } from "@/components/attendee-avatar"
import { UpcomingMeeting } from "@workspace/types"

export function UpcomingMeetingItem({
  meeting,
  isTomorrow,
}: {
  meeting: UpcomingMeeting
  isTomorrow: boolean
}) {
  const canJoin = meeting.action === "join"

  const ctaVariant = canJoin ? "default" : "outline"

  const platformLabel = meeting.meetingUrl ? meeting.platform : ""

  const handleAction = () => {
    if (meeting.meetingUrl && meeting.action === "join") {
      window.open(meeting.meetingUrl, "_blank", "noopener,noreferrer")
    } else {
      window.open(meeting.calendarUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Card
      className={cn(
        isTomorrow &&
          "border border-dashed border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-card"
      )}
    >
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <div className="flex justify-between gap-1">
            <h4 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold">
              {meeting.title}
            </h4>
            <Button
              onClick={handleAction}
              size="xs"
              variant={ctaVariant}
              className={cn(
                "text-[10px] uppercase",
                !canJoin && isTomorrow && "border-gray-200 dark:border-gray-800"
              )}
            >
              {meeting.action}
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <ClockCircle />
            <span>
              {meeting.timestamp} • {meeting.duration}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800",
            isTomorrow && "border-gray-200"
          )}
        >
          <AttendeeAvatar
            attendees={meeting.attendees}
            extra={meeting.extraAttendees}
          />

          <span className="text-xs font-medium text-muted-foreground">
            {platformLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
