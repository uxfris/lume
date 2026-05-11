import { meetingApi } from "@workspace/api-client"
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
import { useState } from "react"
import { toast } from "sonner"

export function DeleteMeetingDialog({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: Meeting
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const deleteMeeting = async () => {
    try {
      setLoading(true)
      await meetingApi.deleteMeeting(meeting.id)
      toast.success("Meeting deleted successfully")
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }
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
