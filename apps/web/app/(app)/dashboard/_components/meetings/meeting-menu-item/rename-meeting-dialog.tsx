import { Meeting } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { useRenameMeeting } from "../../../_hooks/use-rename-meeting"

export function RenameMeeting({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: Meeting
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { loading, title, setTitle, renameMeeting } = useRenameMeeting({
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    onOpenChange,
  })
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) return
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:min-w-md">
        <DialogHeader>
          <DialogTitle>Rename Meeting</DialogTitle>
          <DialogDescription>
            Update how this meeting appears in your workspace.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="meeting-name">Display Name</FieldLabel>
          <Input
            autoFocus
            id="meeting-name"
            defaultValue={meeting.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter meeting title"
          />
        </Field>
        <DialogFooter>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              onClick={renameMeeting}
              disabled={title.length === 0 || loading}
            >
              {loading ? <Spinner /> : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
