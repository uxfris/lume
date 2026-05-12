import { CheckCircle, InfoCircle, VideocameraAdd } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import Link from "next/link"

type JoinMeetingSuccessfulDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  meetingUrl: string
}

export function JoinMeetingSuccessfulDialog({
  open,
  onOpenChange,
  meetingUrl,
}: JoinMeetingSuccessfulDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-8 pt-10 text-center sm:max-w-md">
        <DialogHeader className="flex items-center">
          <div className="w-fit rounded-md bg-muted p-3">
            <CheckCircle weight="Bold" size={32} className="text-primary" />
          </div>
        </DialogHeader>
        <div className="w-full space-y-3 px-6">
          <DialogTitle className="text-2xl font-semibold">
            Lume assistant has been invited to the meeting
          </DialogTitle>
          <p className="text-base text-muted-foreground">
            Once joined, Lume assistant will automatically start taking notes.
          </p>
        </div>
        <Button size="lg" className="mx-4" asChild>
          <Link href={meetingUrl} target="_blank" rel="noopener noreferrer">
            <VideocameraAdd />
            Open meeting
          </Link>
        </Button>
        <DialogFooter className="bg-muted text-left">
          <div className="flex gap-3 text-muted-foreground">
            <InfoCircle weight="Bold" size={24} />
            <p>
              Lume needs to stay inside the meeting for at least 3 minutes to
              process the meeting transcript.
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
