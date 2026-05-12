"use client"

import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { JoinMeetingDialog } from "../../../../_components/live-sync/join-meeting-dialog"
import { JoinMeetingSuccessfulDialog } from "../../../../_components/live-sync/join-meeting-successful-dialog"
import { Plus } from "lucide-react"
import { Hashtag } from "@solar-icons/react"
import { AddMeetingToChannelDialog } from "./channel-menu-action/add-meeting-to-channel-dialog"

export function MeetingChannelEmpty({ channelId }: { channelId: string }) {
  const [meetingUrl, setMeetingUrl] = useState("")
  const [openForm, setOpenForm] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)

  const onSuccess = (meetingUrl: string) => {
    setMeetingUrl(meetingUrl)
    setOpenForm(false)
    setOpenSuccess(true)
  }

  return (
    <div className="h-full px-10 pb-10">
      <div className="flex h-full flex-col items-center justify-center gap-8 rounded-md bg-card pb-10">
        <Hashtag size={32} />
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">This channel is empty</h1>
          <p className="text-center text-xs text-muted-foreground">
            Start meetings or add existing ones <br /> to organize your work.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenForm(true)}>Start meeting</Button>
          <Button variant="secondary">
            <Plus />
            Add existing
          </Button>
        </div>
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
        <AddMeetingToChannelDialog
          channelId={channelId}
          open={openAdd}
          onOpenChange={setOpenAdd}
        />
      </div>
    </div>
  )
}
