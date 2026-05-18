"use client"

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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  value: string
  onValueChange: (value: string) => void
  onContinue: () => void
}

export function ConfirmEmailDialog({
  open,
  onOpenChange,
  email,
  value,
  onValueChange,
  onContinue,
}: Props) {
  const isConfirmed = value.trim().toLowerCase() === email.trim().toLowerCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Confirm email</DialogTitle>
          <DialogDescription>
            Type your email address to confirm: {email}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel className="normal-case text-sm font-semibold text-popover-foreground">
            Type your email address to confirm
          </FieldLabel>
          <Input
            placeholder="email@domain.com"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          />
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
          <Button onClick={onContinue} disabled={!isConfirmed}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
