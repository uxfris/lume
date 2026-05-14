import { Hashtag, InfoCircle } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { MoveRight } from "lucide-react"
import { useChannelQuery } from "../../channel/_hooks/queries/use-channel-query"
import { Spinner } from "@workspace/ui/components/spinner"
import { Meeting } from "@workspace/types"
import { useMoveMeetingsToChannel } from "../../_hooks/use-move-meetings-to-channel"

export function MoveToChannelDialog({ meetingIds }: { meetingIds: string[] }) {
  const { channels } = useChannelQuery()

  const { selectedChannel, setSelectedChannel, moveMeetings, loading } =
    useMoveMeetingsToChannel(meetingIds)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="xs" variant="ghost">
          <Hashtag />
          {/* TODO: conditionally 'Remove from channel' if it's on the channel tab */}
          Move to channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to channel</DialogTitle>
          <DialogDescription>
            Select a channel to move the selected meetings to.
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-64 flex-col overflow-y-auto pb-2">
          <div className="flex-1 space-y-3">
            {channels.length === 0 && (
              <div className="flex h-56 flex-col items-center justify-center gap-6">
                <Hashtag size={40} />
                <div className="space-y-2 text-center">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    No other channel available
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    To move meetings, you must first create a new channel.
                  </p>
                </div>
              </div>
            )}
            {channels.map((channel) => (
              <Button
                onClick={() => setSelectedChannel(channel)}
                key={channel.id}
                variant={
                  channel.id === selectedChannel?.id ? "secondary" : "outline"
                }
                className="w-full justify-start"
              >
                <Hashtag />
                {channel.name}
              </Button>
            ))}
          </div>
        </div>
        {channels.length > 0 && (
          <div className="flex items-center gap-2">
            <InfoCircle />
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                2 meetings selected
              </span>
              {selectedChannel && <MoveRight size={12} />}
              {selectedChannel && (
                <span className="text-sm font-semibold text-muted-foreground">
                  {selectedChannel.name}
                </span>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <div className="flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
            <Button
              disabled={!selectedChannel || loading}
              onClick={moveMeetings}
            >
              <Hashtag />
              {loading ? <Spinner /> : "Move to Channel"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
