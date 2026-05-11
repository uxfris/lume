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
import { toast } from "sonner"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useState } from "react"
import { meetingApi } from "@workspace/api-client"
import { Spinner } from "@workspace/ui/components/spinner"
import { useRouter } from "next/navigation"

export function RenameMeeting({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: Meeting
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(meeting.title)

  const renameMeeting = async () => {
    try {
      setLoading(true)
      await meetingApi.updateMeeting(meeting.id, { title: title })
      toast.success("Meeting renamed successfully")
      onOpenChange(false)

      router.refresh()
    } finally {
      setLoading(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
