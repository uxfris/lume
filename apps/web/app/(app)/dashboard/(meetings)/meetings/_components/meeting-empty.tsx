"use client"

import { Button } from "@workspace/ui/components/button"
import LogoIcon from "@/assets/icons/logo-icon"
import { JoinMeetingDialog } from "../../../_components/live-sync/join-meeting-dialog"
import { useState } from "react"
import { JoinMeetingSuccessfulDialog } from "../../../_components/live-sync/join-meeting-successful-dialog"

export function MeetingEmpty() {
  const [meetingUrl, setMeetingUrl] = useState("")
  const [openForm, setOpenForm] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)

  const onSuccess = (meetingUrl: string) => {
    setMeetingUrl(meetingUrl)
    setOpenForm(false)
    setOpenSuccess(true)
  }

  return (
    <div className="h-full px-4 pb-4 md:px-10 md:py-10">
      <div className="flex h-full flex-col items-center justify-center gap-8 rounded-md bg-card px-16 pb-10 text-center">
        <LogoIcon className="h-12 w-12" />
        <h1 className="text-xl font-semibold">
          Meetings you created will appear here
        </h1>
        <Button variant="outline" onClick={() => setOpenForm(true)}>
          Start meeting
        </Button>
        <JoinMeetingDialog
          open={openForm}
          onOpenChange={setOpenForm}
          onSuccess={onSuccess}
        />
        <JoinMeetingSuccessfulDialog
          open={openSuccess}
          onOpenChange={setOpenSuccess}
          meetingUrl={meetingUrl}
        />
      </div>
    </div>
  )
}
