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
} from "@workspace/ui/components/alert-dialog"
import { Spinner } from "@workspace/ui/components/spinner"
import { useDeleteMeeting } from "../../../_hooks/use-delete-meeting"

export function DeleteMeetingDialog({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: Meeting
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { deleteMeeting, loading } = useDeleteMeeting({
    meetingId: meeting.id,
    onOpenChange,
  })
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {meeting.title}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.{" "}
            <span className="text-destructive">
              This will permanently delete your meeting.
            </span>{" "}
            The minutes consumed on your account will be decreased.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={deleteMeeting}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
