import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ScheduleNewMeetingButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="xs" className="text-primary">
          Schedule new meeting
          <ArrowRight />
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
        </DialogHeader>
        <Separator />
        <DialogDescription>
          Your AI Notetaker will be invited to the calendar meeting to record,
          transcribe and summarize.
        </DialogDescription>
        <Button variant="secondary" asChild>
          <Link
            href="https://calendar.google.com/calendar/u/0/r/eventedit"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={"/vectors/google-calendar.svg"}
              alt={""}
              width={14}
              height={14}
            />
            Google Calendar
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link
            href="https://outlook.live.com/calendar/0/deeplink/compose"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={"/vectors/outlook.svg"}
              alt={""}
              width={16}
              height={16}
            />
            Microsoft Outlook
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
