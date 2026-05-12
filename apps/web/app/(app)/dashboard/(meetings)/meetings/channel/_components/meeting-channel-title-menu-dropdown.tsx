"use client"

import { MenuDots, Pen, TrashBin2 } from "@solar-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CreateChannelDialog } from "../../_components/create-channel-dialog"
import { AddMeetingToChannelDialog } from "./channel-menu-action/add-meeting-to-channel-dialog"
import { DeleteChannelDialog } from "./channel-menu-action/delete-channel-dialog"
import { cn } from "@workspace/ui/lib/utils"
import type { ChannelType } from "@workspace/types"

export function ChannelTitleMenuDropdown({
  isSidebar,
  channelId,
  channelName,
  channelType,
}: {
  isSidebar?: boolean
  channelId: string
  channelName: string
  channelType?: ChannelType
}) {
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MenuDots
            weight="Bold"
            className={cn(
              "cursor-pointer",
              isSidebar &&
                "opacity-0 transition-all duration-200 group-hover/channel:opacity-100 data-[state=open]:opacity-100"
            )}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-fit text-sm font-medium">
          <DropdownMenuItem
            onSelect={() => setOpenAdd(true)}
            className="px-4 py-3"
          >
            <Plus />
            Add meetings
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setOpenEdit(true)}
            className="px-4 py-3"
          >
            <Pen />
            Edit channel
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setOpenDelete(true)}
            className="px-4 py-3 text-destructive"
          >
            <TrashBin2 />
            Delete channel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddMeetingToChannelDialog
        channelId={channelId}
        open={openAdd}
        onOpenChange={setOpenAdd}
      />
      <CreateChannelDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        isEdit={true}
        channelName={channelName}
        channelId={channelId}
        channelType={channelType}
      />
      <DeleteChannelDialog open={openDelete} onOpenChange={setOpenDelete} />
    </>
  )
}
