"use client"

import { FolderSecurity, Hashtag, Widget2 } from "@solar-icons/react"
import { channelApi } from "@workspace/api-client"
import type { ChannelType } from "@workspace/types"
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
  FieldContent,
  FieldDescription,
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
import { Spinner } from "@workspace/ui/components/spinner"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function CreateChannelDialog({
  isEdit,
  channelId,
  channelName,
  channelType,
  open,
  onOpenChange,
}: {
  isEdit?: boolean
  channelId?: string
  channelName?: string
  channelType?: ChannelType
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(channelName ? channelName : "")
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(channelName ?? "")
    setIsPrivate(channelType === "PRIVATE")
  }, [channelName, channelType, open])

  const createChannel = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error("Channel name is required")
      return
    }

    try {
      setLoading(true)
      if (isEdit) {
        if (!channelId) {
          toast.error("Missing channel id")
          return
        }

        await channelApi.updateChannel(channelId, {
          name: trimmedTitle,
          type: isPrivate ? "PRIVATE" : "PUBLIC",
        })
        toast.success("Channel updated successfully")
      } else {
        const created = await channelApi.createChannel({
          name: trimmedTitle,
          type: isPrivate ? "PRIVATE" : "PUBLIC",
        })
        toast.success("Channel created successfully")
        router.push(`/dashboard/meetings/channel/${created.id}`)
      }
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error(
        isEdit ? "Failed to update channel" : "Failed to create channel"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Create"} channel</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Make changes to your chanel"
              : "Create a channel and add meetings to it"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <InputGroup className="h-12 bg-input">
            <InputGroupInput
              autoFocus
              placeholder="eg. Weekly Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <InputGroupAddon>
              <Hashtag />
            </InputGroupAddon>
          </InputGroup>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Visibility
            </h4>
            <RadioGroup
              value={isPrivate ? "personal" : "workspace"}
              onValueChange={(value) => setIsPrivate(value === "personal")}
              className="space-y-2"
            >
              <FieldLabel
                htmlFor="workspace"
                className="group rounded-md hover:bg-secondary"
              >
                <Field orientation="horizontal" className="gap-4">
                  <RadioGroupItem
                    value="workspace"
                    id="workspace"
                    className="group-hover:data-[state=unchecked]:border-foreground"
                  />
                  <FieldContent>
                    <FieldTitle className="gap-1.5 text-sm font-semibold normal-case">
                      <Widget2 />
                      Workspace
                    </FieldTitle>
                    <FieldDescription className="text-sm text-muted-foreground normal-case">
                      All workspace members can see and add meetings to this
                      channel
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel
                htmlFor="personal"
                className="group rounded-md hover:bg-secondary"
              >
                <Field orientation="horizontal" className="gap-4">
                  <RadioGroupItem
                    value="personal"
                    id="personal"
                    className="group-hover:data-[state=unchecked]:border-foreground"
                  />
                  <FieldContent>
                    <FieldTitle className="gap-1.5 text-sm font-semibold normal-case">
                      <FolderSecurity />
                      Personal
                    </FieldTitle>
                    <FieldDescription className="text-sm text-muted-foreground normal-case">
                      Only you can see and add meetings to this channel
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <div className="flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost" disabled={loading}>
                Close
              </Button>
            </DialogClose>
            <Button onClick={createChannel} disabled={loading || !title.trim()}>
              {loading ? <Spinner /> : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
