import { LiveSyncCard } from "./_components/live-sync/live-sync-card"
import { RecentMeetings } from "./_components/meetings/recent-meetings"
import { UpcomingMeetings } from "./_components/upcoming/upcoming-meetings"
import { meetingApi } from "@workspace/api-client"
import { getServerApiFetchOptions } from "@/lib/server-api"

export default async function DashboardPage() {
  const { cookie, workspaceId } = await getServerApiFetchOptions()
  const [meetings, liveMeetings, upcomingMeetings] = await Promise.all([
    meetingApi.getMeetings({
      limit: 50,
      cookie,
      workspaceId,
    }),
    meetingApi.getLiveMeetings({ cookie, workspaceId }),
    meetingApi.getUpcomingMeetings({
      cookie,
      workspaceId,
    }),
  ])

  return (
    <div className="flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 space-y-8 overflow-y-auto px-4 py-8 md:px-10 lg:no-scrollbar">
        <LiveSyncCard />
        <RecentMeetings
          initialMeetings={meetings.meetings}
          initialCursor={meetings.nextCursor}
          liveMeetings={liveMeetings}
        />

        {/* Show on mobile + tablet only */}
        <div className="lg:hidden">
          <UpcomingMeetings groups={upcomingMeetings} />
        </div>
      </div>

      {/* Sidebar - desktop only */}
      <div className="hidden w-[350px] shrink-0 py-8 pr-10 lg:flex">
        <UpcomingMeetings groups={upcomingMeetings} />
      </div>
    </div>
  )
}
