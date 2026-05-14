import { MeetingToolbar } from "../meetings/_components/meeting-toolbar"
import { MeetingView } from "../meetings/_components/meeting-view"
import { MeetingBulkActionBar } from "../meetings/_components/meeting-bulk-action-bar"
import { MeetingEmptyGlobal } from "../_components/meeting-empty-global"
import { getServerApiFetchOptions } from "@/lib/server-api"
import { meetingApi } from "@workspace/api-client"

export default async function MeetingsSharedWithMe() {
  const { cookie, workspaceId } = await getServerApiFetchOptions()
  const response = await meetingApi.getMeetings({
    limit: 50,
    isSharedWithMe: true,
    cookie,
    workspaceId,
  })

  const meetings = response.meetings

  if (meetings.length === 0) return <MeetingEmptyGlobal variant="shared" />
  return (
    <div className="relative flex h-full flex-col gap-6 overflow-hidden">
      <div className="hidden items-center gap-3 px-4 pt-4 md:flex md:px-10 md:pt-10">
        <h1 className="text-base font-semibold">Meetings shared with me</h1>
      </div>
      <div className="space-y-4 overflow-y-auto px-4 pb-10 md:space-y-10 md:px-10">
        <div className="space-y-3">
          <MeetingToolbar />
        </div>
        <MeetingView
          initialMeetings={meetings}
          initialCursor={response.nextCursor}
        />
      </div>
      <MeetingBulkActionBar meetings={meetings} />
    </div>
  )
}
