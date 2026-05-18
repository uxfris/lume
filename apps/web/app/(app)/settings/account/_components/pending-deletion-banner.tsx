"use client"

import { ClockCircle } from "@solar-icons/react"
import { formatDateOnly } from "@/lib/date-format"
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
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { accountDeletionKeys } from "../_hooks/use-account-deletion-context"
import { useCancelAccountDeletionMutation } from "../_hooks/use-cancel-account-deletion-mutation"

type Props = {
  email: string
  scheduledDeletionAt: string
}

export function PendingDeletionBanner({ email, scheduledDeletionAt }: Props) {
  const [open, setOpen] = useState(false)
  const [emailConfirmation, setEmailConfirmation] = useState("")
  const cancelDeletion = useCancelAccountDeletionMutation()
  const queryClient = useQueryClient()

  const isConfirmed =
    emailConfirmation.trim().toLowerCase() === email.trim().toLowerCase()

  const onCancel = async () => {
    try {
      await cancelDeletion.mutateAsync({ email: emailConfirmation })
      setOpen(false)
      setEmailConfirmation("")
      await queryClient.invalidateQueries({
        queryKey: accountDeletionKeys.context,
      })
      toast.success("Account deletion cancelled")
    } catch {
      // Mutation meta surfaces API errors via the global handler.
    }
  }

  return (
    <>
      <div className="mx-5 mb-4 flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <div className="flex items-start gap-2">
          <ClockCircle className="mt-0.5 shrink-0 text-destructive" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-destructive">
              Your account is scheduled for deletion
            </p>
            <p className="text-muted-foreground">
              Permanent deletion on{" "}
              <span className="font-semibold text-foreground">
                {formatDateOnly(scheduledDeletionAt)}
              </span>
              . You can cancel this request before that date.
            </p>
          </div>
        </div>
        <Button className="self-end" onClick={() => setOpen(true)}>
          Cancel deletion
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Cancel account deletion</DialogTitle>
            <DialogDescription>
              Type your email address to keep your account: {email}
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel className="text-sm font-semibold text-popover-foreground normal-case">
              Email address
            </FieldLabel>
            <Input
              placeholder="email@domain.com"
              value={emailConfirmation}
              onChange={(event) => setEmailConfirmation(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={cancelDeletion.isPending}>
                Close
              </Button>
            </DialogClose>
            <Button
              onClick={onCancel}
              disabled={!isConfirmed || cancelDeletion.isPending}
            >
              {cancelDeletion.isPending ? <Spinner /> : "Keep my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
