"use client"

import { FolderSecurity, Hashtag, Widget2 } from "@solar-icons/react"

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

import {
  UpdateChannelPayload,
  useUpdateChannelMutation,
} from "../channel/_hooks/use-update-channel-mutation"
import {
  CreateChannelPayload,
  useCreateChannelMutation,
} from "../channel/_hooks/use-create-channel-mutation"
import { useChannelForm } from "../channel/_hooks/use-channel-form"

type Props = {
  isEdit?: boolean
  channelId?: string
  channelName?: string
  channelType?: ChannelType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateChannelDialog({
  isEdit,
  channelId,
  channelName,
  channelType,
  open,
  onOpenChange,
}: Props) {
  const { title, setTitle, isPrivate, setIsPrivate } = useChannelForm({
    open,
    initialName: channelName,
    initialType: channelType,
  })

  const createMutation = useCreateChannelMutation(onOpenChange)

  const updateMutation = useUpdateChannelMutation(onOpenChange)

  const mutation = isEdit ? updateMutation : createMutation

  const loading = mutation.loading

  const payload = {
    name: title.trim(),
    type: isPrivate ? "PRIVATE" : "PUBLIC",
  } as const

  const handleSubmit = () => {
    if (isEdit) {
      if (!channelId) return

      const updatePayload: UpdateChannelPayload = {
        id: channelId,
        ...payload,
      }

      updateMutation.updateChannel(updatePayload)

      return
    }

    const createPayload: CreateChannelPayload = payload

    createMutation.createChannel(createPayload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Create"} channel</DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Make changes to your channel"
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

            <Button onClick={handleSubmit} disabled={loading || !title.trim()}>
              {loading ? <Spinner /> : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
