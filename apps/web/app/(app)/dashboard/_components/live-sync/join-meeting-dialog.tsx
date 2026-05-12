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
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { botsApi } from "@workspace/api-client"
import { Spinner } from "@workspace/ui/components/spinner"

const schema = z.object({
  url: z
    .url("Must be a valid URL (https://example.com)")
    .min(1, "Meeting url is required")
    .refine(
      (val) =>
        val.includes("meet.google.com") ||
        val.includes("teams.microsoft.com") ||
        val.includes("https://zoom.us"),
      "Only Google Meet,Microsoft Teams, and Zoom link are allowed"
    ),
  name: z.string().optional(),
})

type JoinMeetingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (meetingUrl: string) => void
  meetingUrl?: string
}

export function JoinMeetingDialog({
  open,
  onOpenChange,
  onSuccess,
  meetingUrl,
}: JoinMeetingDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      url: meetingUrl,
      name: "",
    },
  })

  useEffect(() => {
    if (open) {
      // defaultValues only apply on mount; parent passes meetingUrl after outer form submit,
      // so we must sync or hidden-field validation fails and handleSubmit never runs joinMeeting.
      form.reset({
        url: meetingUrl ?? "",
        name: "",
      })
    } else {
      form.reset()
    }
  }, [open, meetingUrl, form])

  const joinMeeting = async (data: z.infer<typeof schema>) => {
    setLoading(true)
    await botsApi.startBotMeeting({
      meetingUrl: meetingUrl ?? data.url,
      title: data.name,
    })
    setLoading(false)
    onSuccess(meetingUrl ?? data.url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Meeting</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <Separator />
        <form
          className="space-y-6 py-2"
          onSubmit={form.handleSubmit(joinMeeting)}
        >
          {!meetingUrl && (
            <Field>
              <FieldLabel htmlFor="meeting-url">Meeting Url</FieldLabel>
              <Input
                {...form.register("url")}
                id="meeting-url"
                placeholder="Paste meeting URL (Google Meet, Teams)"
                className="h-12"
              />
              {form.formState.errors.url?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.url.message}
                </p>
              )}
            </Field>
          )}
          <Field className="gap-3">
            <FieldLabel htmlFor="meeting-name">
              Meeting name (Optional)
            </FieldLabel>
            <Input
              {...form.register("name")}
              id="meeting-name"
              placeholder="e.g., Weekly Sync"
            />
          </Field>
          <DialogFooter>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="ghost" type="button">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : "Join Now"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
