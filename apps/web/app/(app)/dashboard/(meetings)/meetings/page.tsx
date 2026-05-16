import { TitleMenuDropdown } from "./_components/meeting-title-menu-dropdown"
import { MeetingToolbar } from "./_components/meeting-toolbar"
import { MeetingChannelButtons } from "./_components/meeting-channel-buttons"
import { MeetingView } from "./_components/meeting-view"
import { MeetingBulkActionBar } from "./_components/meeting-bulk-action-bar"
import type { Meeting } from "@workspace/types"
import { MeetingEmpty } from "./_components/meeting-empty"
import { getServerApiFetchOptions } from "@/lib/server-api"
import { meetingApi } from "@workspace/api-client"

export default async function Meeting() {
  const { cookie, workspaceId } = await getServerApiFetchOptions()
  const [response] = await Promise.all([
    meetingApi.getMeetings({
      limit: 50,
      cookie,
      workspaceId,
    }),
  ])

  const meetings = response.meetings

  if (meetings.length === 0) return <MeetingEmpty />
  return (
    <div className="relative flex h-full flex-col gap-6 overflow-hidden">
      <div className="hidden items-center gap-3 px-4 pt-4 md:flex md:px-10 md:pt-10">
        <h1 className="text-base font-semibold">Meetings</h1>
        <TitleMenuDropdown />
      </div>
      <div className="space-y-10 overflow-y-auto px-4 pb-4 md:px-10 md:pb-10">
        <div className="space-y-3">
          <MeetingToolbar />
          <MeetingChannelButtons />
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
