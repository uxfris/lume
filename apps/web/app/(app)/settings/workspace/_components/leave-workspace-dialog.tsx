"use client"

import { Button } from "@workspace/ui/components/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { useLeaveWorkspaceMutation } from "../../people/_hooks/mutations/use-people-mutations"

export function LeaveWorkspaceDialog({ canLeave }: { canLeave: boolean }) {
  const { mutate: leaveWorkspace, isPending } = useLeaveWorkspaceMutation()

  return (
    <span className="w-full flex justify-end">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={!canLeave} variant="destructive">
            Leave workspace
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this workspace?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() => leaveWorkspace()}
            >
              Leave workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  )
}
