"use client"

import { Bolt } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { useState } from "react"
import { JoinMeetingDialog } from "./join-meeting-dialog"
import { JoinMeetingSuccessfulDialog } from "./join-meeting-successful-dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"

const schema = z.object({
  url: z
    .url("Must be a valid URL (https://example.com)")
    .min(1, "Meeting url is required")
    .refine(
      (val) =>
        val.includes("meet.google.com") || val.includes("teams.microsoft.com"),
      "Only Google Meet or Microsoft Teams link are allowed"
    ),
})

export function LiveSyncCard() {
  const [openForm, setOpenForm] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      url: "",
    },
  })

  const joinMeeting = (data: { url: string }) => {
    setOpenForm(true)
  }

  const onSuccess = () => {
    setOpenForm(false)
    setOpenSuccess(true)
  }

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
