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
import { Spinner } from "@workspace/ui/components/spinner"
import { useJoinMeeting } from "../../_hooks/use-join-meeting"

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
  const { form, joinMeeting, loading, error } = useJoinMeeting({
    open,
    onSuccess,
    meetingUrl,
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) return
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Meeting</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Separator />

        <form
          className="space-y-6 py-2"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await joinMeeting(values)
            } catch {
              // handled by mutation state
            }
          })}
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

          {error && (
            <p className="text-sm text-destructive">Failed to join meeting</p>
          )}

          <DialogFooter>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="ghost" type="button" disabled={loading}>
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
