"use client"

import { MinimalisticMagnifier } from "@solar-icons/react"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { Spinner } from "@workspace/ui/components/spinner"
import { useAddMeetingsToChannel } from "../../../_hooks/use-add-meetings-to-channel"

export function AddMeetingToChannelDialog({
  channelId,
  open,
  onOpenChange,
}: {
  channelId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {
    search,
    setSearch,
    isLoading,
    isError,
    filteredMeetings,
    toggleMeeting,
    selectedMeetings,
    addMettingstoChannel,
    isAddLoading,
  } = useAddMeetingsToChannel({ channelId, onOpenChange })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isAddLoading) return
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add meetings to channel</DialogTitle>

          <DialogDescription>
            Select meetings to add to this channel. A meeting can only belong to
            one channel at a time.
          </DialogDescription>
        </DialogHeader>

        <InputGroup className="h-10 bg-input">
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings..."
          />

          <InputGroupAddon>
            <MinimalisticMagnifier />
          </InputGroupAddon>
        </InputGroup>

        <div className="max-h-64 space-y-3 overflow-y-auto">
          {isLoading && (
            <div className="py-4 text-sm text-muted-foreground">
              Loading meetings...
            </div>
          )}

          {isError && (
            <div className="py-4 text-sm text-destructive">
              Failed to load meetings.
            </div>
          )}

          {!isLoading && !isError && filteredMeetings.length === 0 && (
            <div className="py-4 text-sm text-muted-foreground">
              No meetings found.
            </div>
          )}

          {!isLoading &&
            !isError &&
            filteredMeetings.map((meeting) => {
              const checked = selectedMeetings.includes(meeting.id)

              return (
                <div
                  key={meeting.id}
                  onClick={() => toggleMeeting(meeting.id)}
                  className="flex w-full items-center justify-between rounded-md border border-border p-4 text-left transition-colors hover:bg-secondary"
                >
                  <span className="text-sm font-medium text-popover-foreground">
                    {meeting.title}
                  </span>

                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleMeeting(meeting.id)}
                    className="pointer-events-none h-5 w-5"
                  />
                </div>
              )
            })}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>

          <Button
            disabled={selectedMeetings.length === 0 || isAddLoading}
            onClick={addMettingstoChannel}
          >
            {isAddLoading ? (
              <Spinner />
            ) : (
              `Add ${selectedMeetings.length} meeting${
                selectedMeetings.length !== 1 ? "s" : ""
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
