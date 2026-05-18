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
  workspaceName: string
  value: string
  onValueChange: (value: string) => void
  onContinue: () => void
}

export function ConfirmWorkspaceDeletionDialog({
  open,
  onOpenChange,
  workspaceName,
  value,
  onValueChange,
  onContinue,
}: Props) {
  const isConfirmed = value.trim() === workspaceName

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Confirm workspace deletion</DialogTitle>
          <DialogDescription>
            You own this workspace. To keep it, transfer ownership to another
            member before deleting your account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-md bg-secondary px-4 py-3">
          <h3 className="text-sm text-muted-foreground">Workspace</h3>
          <p className="text-base font-semibold">{workspaceName}</p>
        </div>
        <Field>
          <FieldLabel className="normal-case text-sm font-semibold text-popover-foreground">
            Type the workspace name to confirm
          </FieldLabel>
          <Input
            placeholder="Workspace name"
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
