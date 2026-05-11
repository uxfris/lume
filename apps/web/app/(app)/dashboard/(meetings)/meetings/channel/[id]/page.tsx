import { channelApi } from "@workspace/api-client"
import { Meeting } from "@workspace/types"
import { MeetingsProvider } from "../../_hooks/use-meeting-context"
import { MeetingToolbar } from "../../_components/meeting-toolbar"
import { MeetingView } from "../../_components/meeting-view"
import { MeetingBulkActionBar } from "../../_components/meeting-bulk-action-bar"
import { MeetingChannelEmpty } from "../_components/meeting-channel-empty"
import { ChannelTitleMenuDropdown } from "../_components/meeting-channel-title-menu-dropdown"
import { ArrowLeft } from "@solar-icons/react/ssr"
import { getServerApiFetchOptions } from "@/lib/server-api"
import Link from "next/link"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MeetingChannel({ params }: PageProps) {
  const { id } = await params
  const { cookie, workspaceId } = await getServerApiFetchOptions()

  let channel
  try {
    channel = await channelApi.getChannel(id, { cookie, workspaceId })
  } catch {
    notFound()
  }

  const channelMeetings = await channelApi.getChannelMeetings(id, {
    cookie,
    workspaceId,
    limit: 50,
  })
  const meetings: Meeting[] = channelMeetings

  return (
    <div className="relative flex h-full flex-col gap-6 overflow-hidden">
      <div className="hidden items-center gap-3 px-4 pt-4 md:flex md:px-10 md:pt-10">
        <Link href="/dashboard/meetings">
          <ArrowLeft />
        </Link>
        <h1 className="text-base font-semibold">{channel.name}</h1>
        <ChannelTitleMenuDropdown
          channelId={channel.id}
          channelName={channel.name}
          channelType={channel.type}
        />
      </div>
      {meetings.length === 0 ? (
        <MeetingChannelEmpty />
      ) : (
        <>
          <div className="space-y-4 overflow-y-auto px-4 pb-10 md:space-y-10 md:px-10">
            <div className="space-y-3">
              <MeetingsProvider meetings={meetings}>
                <MeetingToolbar />
              </MeetingsProvider>
            </div>
            <MeetingView meetings={meetings} />
          </div>
          <MeetingBulkActionBar meetings={meetings} isChannel={true} />
        </>
      )}
    </div>
  )
}
