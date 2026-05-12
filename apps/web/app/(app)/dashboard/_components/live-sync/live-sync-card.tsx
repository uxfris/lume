"use client"

import { Bolt } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { JoinMeetingDialog } from "./join-meeting-dialog"
import { JoinMeetingSuccessfulDialog } from "./join-meeting-successful-dialog"
import { useLiveSyncCard } from "../../_hooks/use-live-sync-card"

export function LiveSyncCard() {
  const {
    form,
    joinMeeting,
    openForm,
    setOpenForm,
    onSuccess,
    openSuccess,
    setOpenSuccess,
  } = useLiveSyncCard()
  return (
    <Card className="w-full p-0">
      <CardContent className="space-y-6 p-8">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Live Sync</h2>
          <p className="text-sm text-muted-foreground">
            Add the Lume assistant to your current active meeting.
          </p>
        </div>
        {/* Input */}
        <form className="flex gap-3" onSubmit={form.handleSubmit(joinMeeting)}>
          <div className="flex-1 space-y-1">
            <Input
              {...form.register("url")}
              placeholder="Paste meeting URL (Google Meet, Teams, Zoom)"
              className="h-12"
            />
            {form.formState.errors.url?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.url.message}
              </p>
            )}
          </div>
          <Button type="submit" size="xl" className="shrink-0 gap-2">
            <Bolt />
            Join Now
          </Button>
          <JoinMeetingDialog
            open={openForm}
            onOpenChange={setOpenForm}
            onSuccess={onSuccess}
            meetingUrl={form.getValues("url")}
          />
          <JoinMeetingSuccessfulDialog
            open={openSuccess}
            onOpenChange={setOpenSuccess}
            meetingUrl={form.getValues("url")}
          />
        </form>
      </CardContent>
    </Card>
  )
}
