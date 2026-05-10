import type { LiveMeeting } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

type LiveMeetingsProps = {
  meetings: LiveMeeting[]
}

export function LiveMeetings({ meetings }: LiveMeetingsProps) {
  if (meetings.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">
        Live now
      </h3>
      <div className="space-y-2">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardContent className="flex items-center gap-2 py-3">
              <div className="flex shrink-0 items-center gap-1.5 bg-red-100 px-2 py-1 dark:bg-red-950/50">
                <div className="h-1 w-1 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  LIVE
                </span>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {meeting.timestamp}
              </span>
              <h3 className="line-clamp-1 min-w-0 flex-1 text-base font-semibold">
                {meeting.title}
              </h3>
              {meeting.meetingUrl ? (
                <Button variant="outline" size="xs" className="shrink-0 uppercase" asChild>
                  <a
                    href={meeting.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="xs"
                  className="shrink-0 uppercase"
                  disabled
                  title="No join link available"
                >
                  Join
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
