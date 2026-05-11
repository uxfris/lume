import MeetingItem from "./meeting-item"
import { cn } from "@workspace/ui/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { meetingApi } from "@workspace/api-client"
import { getServerApiFetchOptions } from "@/lib/server-api"
import { LiveMeetings } from "./live-meetings"

export async function RecentMeetings() {
  const { cookie, workspaceId } = await getServerApiFetchOptions()
  const [meetings, liveMeetings] = await Promise.all([
    meetingApi.getMeetingsList({
      limit: 50,
      cookie,
      workspaceId,
    }),
    meetingApi.getLiveMeetings({ cookie, workspaceId }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-[-0.4px]">
          Recent Meetings
        </h2>
      </div>
      <LiveMeetings meetings={liveMeetings} />
      {meetings.length === 0 ? (
        <EmptyState
          title="No recent activity yet"
          description="Your meeting summaries and section items will appear here once your first session is processed."
        />
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          {meetings.map((meeting, index) => {
            const isFullWidth = index >= 2 //first 2 = half, rest full
            return (
              <div
                key={meeting.id}
                className={cn(isFullWidth && "md:col-span-2")}
              >
                <MeetingItem meeting={meeting} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
