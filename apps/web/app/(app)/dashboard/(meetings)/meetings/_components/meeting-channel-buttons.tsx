import { routes } from "@/lib/routes"
import { getServerApiFetchOptions } from "@/lib/server-api"
import { Hashtag } from "@solar-icons/react/ssr"
import { channelApi } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export async function MeetingChannelButtons() {
  const { cookie, workspaceId } = await getServerApiFetchOptions()
  const channels = await channelApi.getChannels({ cookie, workspaceId })
  return (
    <div className="flex flex-wrap items-center gap-2">
      {channels.map((channel) => (
        <Button
          key={channel.id}
          variant="outline"
          className="flex-1 shrink-0 md:flex-none"
          asChild
        >
          <Link href={routes.dashboard.meetings.channel(channel.id)}>
            <Hashtag />
            {channel.name}
          </Link>
        </Button>
      ))}
    </div>
  )
}
