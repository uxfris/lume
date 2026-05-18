"use client"

import { TrashBin2 } from "@solar-icons/react"
import { Table } from "@tanstack/react-table"
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
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { WorkspaceMember } from "@workspace/types"

export function DeletePeoplesDialog<TData>({
  table,
  onRemoveMembers,
  isMutating = false,
}: {
  table: Table<TData>
  onRemoveMembers?: (memberIds: string[]) => void
  isMutating?: boolean
}) {
  const [open, setOpen] = useState(false)

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  const onDelete = () => {
    const memberIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => (row.original as WorkspaceMember).id)
    onRemoveMembers?.(memberIds)
    table.resetRowSelection()
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="xs"
          variant="destructive"
          className="bg-transparent text-destructive hover:text-destructive hover:bg-destructive/20 dark:bg-transparent dark:hover:bg-destructive/20"
        >
          <TrashBin2 />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove workspace member?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{" "}
            <span className="font-semibold text-popover-foreground">
              {selectedCount} member{selectedCount === 1 ? "" : "s"}
            </span>{" "}
            from this workspace. They will no longer have access to any
            workspace projects or resources.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onDelete}
            disabled={isMutating}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
