"use client"

import { DangerTriangle } from "@solar-icons/react"
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
import { toast } from "sonner"
import { useDeleteChannelMutation } from "../../_hooks/mutations/use-delete-channel-mutation"
import { Spinner } from "@workspace/ui/components/spinner"

export function DeleteChannelDialog({
  channelId,
  channelName,
  isFromChannel,
  open,
  onOpenChange,
}: {
  channelId: string
  channelName: string
  isFromChannel: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteChannelMutation({
    isFromChannel,
    onOpenChange,
  })
  const loading = deleteMutation.loading

  const deleteChannel = () => {
    deleteMutation.deleteChannel({ id: channelId })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) return
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete channel</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {channelName} channel?
            <br />
            Projects won't be deleted, only the channel.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 rounded-md bg-destructive/20 p-4">
          <DangerTriangle size={16} className="pt-1 text-destructive" />
          <div className="space-y-2">
            <h2 className="font-semibold text-destructive">
              Projects will keep their workspace visibility
            </h2>
            <p className="text-destructive">
              They will remain accessible to other workspace members unless
              moved.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={deleteChannel}
          >
            {loading ? <Spinner /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
