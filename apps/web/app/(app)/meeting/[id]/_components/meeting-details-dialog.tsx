"use client"

import { useChannelQuery } from "@/app/(app)/dashboard/(meetings)/meetings/channel/_hooks/queries/use-channel-query"
import { formatDate } from "@/lib/date-format"
import { Meeting } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"

export function MeetingDetailsDialog({
  open,
  onOpenChange,
  meeting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting
}) {
  const { channels } = useChannelQuery()
  const channel = meeting.channelId
    ? channels.find((c) => c.id === meeting.channelId)
    : null

  const location = channel ? `# ${channel.name}` : "No channel"

  const details = [
    {
      label: "Location",
      value: location,
    },
    {
      label: "Host",
      value: meeting.hostName ?? "—",
    },
    {
      label: "Modified",
      value: formatDate(meeting.updatedAt),
    },
    {
      label: "Created",
      value: formatDate(meeting.createdAt),
      noSeparator: true,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Meeting details</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 rounded-lg bg-secondary py-1">
          {details.map((detail) => (
            <div key={detail.label}>
              <div className="flex items-center gap-5 px-5 py-3">
                <div className="w-24 shrink-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    {detail.label}
                  </span>
                </div>
                <p className="text-sm font-medium">{detail.value}</p>
              </div>
              {!detail.noSeparator && (
                <Separator className="bg-secondary brightness-95" />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
