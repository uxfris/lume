import { Hashtag } from "@solar-icons/react"
import { Meeting } from "@workspace/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { removeMeetingsFromChannel } from "../../_hooks/use-remove-meetings-from-channel"

export function RemoveFromChannelDialog({
  meetings,
  selectedMeetingIds,
}: {
  meetings: Meeting[]
  selectedMeetingIds: string[]
}) {
  const { open, setOpen, loading, removeMeetings } = removeMeetingsFromChannel({
    selectedMeetingIds,
  })

  const selectedMeetings = meetings.filter(({ id }) =>
    selectedMeetingIds.includes(id)
  )

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) return
        setOpen(nextOpen)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button size="xs" variant="ghost">
          <Hashtag />
          Remove from channel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Meetings from the channel</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove these meetings from this channel?
            The channel will remain in your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-64 overflow-y-auto px-4">
          {selectedMeetings.map((meeting) => (
            <li
              key={meeting.id}
              className="text-sm font-medium text-muted-foreground"
            >
              {meeting.title}
            </li>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={removeMeetings} disabled={loading}>
              {loading ? <Spinner /> : "Remove"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
