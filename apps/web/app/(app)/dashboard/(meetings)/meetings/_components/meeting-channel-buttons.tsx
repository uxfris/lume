import { Hashtag } from "@solar-icons/react/ssr"
import { channelApi } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export async function MeetingChannelButtons() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {[
        { id: "1", label: "Sprint Planning" },
        { id: "2", label: "Design Reviews" },
      ].map((channel) => (
        <Button
          key={channel.id}
          variant="outline"
          className="flex-1 shrink-0 md:flex-none"
          asChild
        >
          <Link href={`/meetings/${channel.id}`}>
            <Hashtag />
            {channel.label}
          </Link>
        </Button>
      ))}
    </div>
  )
}
