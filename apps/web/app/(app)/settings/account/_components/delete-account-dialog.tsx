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
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Spinner } from "@workspace/ui/components/spinner"
import type { AccountDeletionReason } from "@workspace/types"

const REASONS: { value: AccountDeletionReason; name: string }[] = [
  { value: "not-useful", name: "I didn't find the product useful" },
  { value: "confusing", name: "It's too confusing" },
  { value: "missing-features", name: "Missing features" },
  { value: "too-expensive", name: "Too expensive" },
  { value: "privacy-concerns", name: "Privacy concerns" },
  { value: "switching-product", name: "I'm switching to a different product" },
  { value: "duplicate-account", name: "This is a duplicated account" },
  { value: "other", name: "Other" },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduledDeletionAt: string
  reason: AccountDeletionReason | null
  onReasonChange: (reason: AccountDeletionReason) => void
  onDelete: () => void
  isPending: boolean
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  scheduledDeletionAt,
  reason,
  onReasonChange,
  onDelete,
  isPending,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-1">
        <DialogHeader>
          <DialogTitle>Delete your account</DialogTitle>
          <DialogDescription>
            Your account will be scheduled for permanent deletion after a 7-day
            grace period.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-md bg-secondary p-4">
          <ClockCircle />
          <span className="text-sm">
            Deletion will be scheduled for{" "}
            <span className="font-semibold">
              {formatDateOnly(scheduledDeletionAt)}
            </span>
            .
          </span>
        </div>
        <div className="space-y-2 rounded-md border border-destructive bg-destructive/30 p-4">
          <h2 className="text-base font-medium text-destructive">
            This will permanently delete:
          </h2>
          <ul className="list-disc pl-6 text-sm text-destructive">
            <li>Your active subscriptions</li>
            <li>
              Any workspaces you own, unless you transferred ownership
            </li>
            <li>Your workspace memberships and invitations</li>
            <li>Your account and all associated data</li>
          </ul>
        </div>
        <FieldSet className="gap-3">
          <FieldLegend className="text-sm! font-medium text-muted-foreground">
            Why are you deleting this account?
          </FieldLegend>
          <RadioGroup
            value={reason ?? undefined}
            onValueChange={(value) =>
              onReasonChange(value as AccountDeletionReason)
            }
          >
            {REASONS.map((item) => (
              <Field key={item.value} orientation="horizontal">
                <RadioGroupItem value={item.value} id={item.value} />
                <FieldLabel
                  htmlFor={item.value}
                  className="text-sm normal-case font-medium text-popover-foreground"
                >
                  {item.name}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
        </FieldSet>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" className="flex-1" disabled={isPending}>
              Close
            </Button>
          </DialogClose>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="flex-1"
            disabled={!reason || isPending}
          >
            {isPending ? <Spinner /> : "Schedule deletion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
