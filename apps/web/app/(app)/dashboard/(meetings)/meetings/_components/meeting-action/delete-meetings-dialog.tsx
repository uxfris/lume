import { TrashBin2 } from "@solar-icons/react"
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
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { useDeleteMeetings } from "../../_hooks/use-delete-meetings"
import { useState } from "react"

export function DeleteMeetingsDialog({
  meetings,
  selectedMeetingIds,
}: {
  meetings: Meeting[]
  selectedMeetingIds: string[]
}) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState("")
  const { loading, deleteMeetings } = useDeleteMeetings({
    meetings,
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
        <Button
          size="xs"
          variant="destructive"
          className="bg-transparent text-destructive hover:bg-destructive/20 hover:text-destructive dark:bg-transparent dark:hover:bg-destructive/20"
        >
          <TrashBin2 />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meetings</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete these meetings? This action cannot
            be undone
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
        <div className="space-y-2">
          <p className="to-muted-foreground text-sm">
            To confirm deletion, type{" "}
            <span className="font-semibold">
              DELETE {selectedMeetingIds.length}
            </span>{" "}
            below:
          </p>
          <Input
            className="uppercase"
            autoFocus
            placeholder={`DELETE ${selectedMeetingIds.length}`}
            onChange={(e) => setConfirmDelete(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteMeetings}
            variant="destructive"
            disabled={
              confirmDelete.toLowerCase() !==
                `delete ${selectedMeetingIds.length}` || loading
            }
          >
            {loading ? <Spinner /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
