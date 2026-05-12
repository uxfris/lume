"use client"

import { useMemo, useState } from "react"

import { Meeting } from "@workspace/types"
import { channelApi } from "@workspace/api-client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
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
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"

import { useQuery } from "@tanstack/react-query"
import { Hashtag, MinimalisticMagnifier } from "@solar-icons/react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@workspace/ui/components/spinner"
import { useRouter } from "next/navigation"

const NO_CHANNEL = "no-channel"

export function MoveMeeting({
  meeting,
  open,
  onOpenChange,
  onCreateChannel,
}: {
  meeting: Meeting
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateChannel: () => void
}) {
  const router = useRouter()

  const [moveLoading, setMoveLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    meeting.channelId ?? NO_CHANNEL
  )

  const {
    data: channels = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["channels"],
    queryFn: () => channelApi.getChannels(),
    staleTime: 300_000,
  })

  const query = search.trim().toLowerCase()

  const filteredChannels = !query
    ? channels
    : channels.filter((channel) => channel.name.toLowerCase().includes(query))

  const currentChannelId = meeting.channelId ?? NO_CHANNEL

  const moveMeeting = async () => {
    try {
      setMoveLoading(true)
      if (selectedChannelId === NO_CHANNEL && meeting.channelId) {
        await channelApi.removeMeetingsFromChannel(meeting.channelId, [
          meeting.id,
        ])
        router.refresh()
      } else {
        await channelApi.addMeetingsToChannel(selectedChannelId, [meeting.id])
        router.push(`/dashboard/meetings/channel/${selectedChannelId}`)
      }
      toast.success("Meeting moved successfully")
      onOpenChange(false)
    } catch {
      toast.error("Failed to move meeting")
    } finally {
      setMoveLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Move to channel</DialogTitle>

          <DialogDescription>
            Select a channel to move “{meeting.title}” to. A meeting can only be
            in one channel at a time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <InputGroup className="h-12 bg-input">
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channels..."
              className="font-medium"
            />

            <InputGroupAddon className="size-6">
              <MinimalisticMagnifier />
            </InputGroupAddon>
          </InputGroup>

          <Button
            variant="outline"
            className="h-12 w-full justify-start border-dashed text-muted-foreground-2"
            onClick={onCreateChannel}
          >
            <Plus />
            Create new channel
          </Button>

          <RadioGroup
            value={selectedChannelId}
            onValueChange={setSelectedChannelId}
            className="max-h-64 space-y-1 overflow-y-auto"
          >
            <FieldLabel
              htmlFor="no-channel"
              className="py-1 has-data-checked:border-border has-data-checked:text-popover-foreground"
            >
              <Field orientation="horizontal">
                <RadioGroupItem value="no-channel" id="no-channel" />

                <FieldContent>
                  <FieldTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground normal-case">
                    No Channel
                    {currentChannelId === NO_CHANNEL && (
                      <Badge className="rounded-xs" variant="secondary">
                        Current
                      </Badge>
                    )}
                  </FieldTitle>
                </FieldContent>
              </Field>
            </FieldLabel>

            {isLoading && (
              <div className="py-4 text-sm text-muted-foreground">
                Loading channels...
              </div>
            )}

            {isError && (
              <div className="py-4 text-sm text-destructive">
                Failed to load channels.
              </div>
            )}

            {!isLoading &&
              filteredChannels.map((channel) => (
                <FieldLabel
                  key={channel.id}
                  htmlFor={channel.id}
                  className="py-1 has-data-checked:border-border has-data-checked:text-popover-foreground"
                >
                  <Field orientation="horizontal">
                    <RadioGroupItem value={channel.id} id={channel.id} />

                    <FieldContent>
                      <FieldTitle className="flex items-center gap-2 text-sm font-semibold normal-case">
                        {channel.name}

                        {currentChannelId === channel.id && (
                          <Badge className="rounded-xs" variant="secondary">
                            Current
                          </Badge>
                        )}
                      </FieldTitle>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              ))}

            {!isLoading && filteredChannels.length === 0 && (
              <div className="py-4 text-sm text-muted-foreground">
                No channels found.
              </div>
            )}
          </RadioGroup>
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>

            <Button
              onClick={moveMeeting}
              disabled={selectedChannelId === currentChannelId || moveLoading}
            >
              <Hashtag />
              {moveLoading ? <Spinner /> : "Move to channel"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
