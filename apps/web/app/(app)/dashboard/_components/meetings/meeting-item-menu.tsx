import {
  Hashtag,
  MenuDots,
  Share,
  SquareTopDown,
  Star,
  Text,
  TrashBin2,
} from "@solar-icons/react"
import { Meeting } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import Link from "next/link"
import { useState } from "react"
import { ShareMeetingDialog } from "./meeting-menu-item/share-meeting-dialog"
import { MoveMeeting } from "./meeting-menu-item/move-meeting-dialog"
import { RenameMeeting } from "./meeting-menu-item/rename-meeting-dialog"
import { DeleteMeetingDialog } from "./meeting-menu-item/delete-meeting-dialog"
import { CreateChannelDialog } from "../../(meetings)/meetings/_components/create-channel-dialog"
import { toast } from "sonner"
import { meetingApi } from "@workspace/api-client"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"

export function MeetingItemMenu({ meeting }: { meeting: Meeting }) {
  const router = useRouter()

  const [openShare, setOpenShare] = useState(false)
  const [openMove, setOpenMove] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [openRename, setOpenRename] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const createChannel = () => {
    setOpenMove(false)
    setOpenCreate(true)
  }

  const starMeeting = async () => {
    const isStarred = !meeting.isStarred
    toast.success(isStarred ? "Meeting starred" : "Meeting unstarred")
    await meetingApi.updateMeeting(meeting.id, {
      isStarred,
    })
    router.refresh()
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="opacity-0 transition-all duration-200 group-hover/meeting:opacity-100 data-[state=open]:opacity-100"
          >
            <MenuDots weight="Bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44 space-y-3 p-2 text-sm">
          <DropdownMenuGroup className="space-y-3">
            <DropdownMenuItem asChild>
              <Link
                href={routes.meeting(meeting.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SquareTopDown />
                Open in a new tab
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpenShare(true)}>
              <Share />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={starMeeting}>
              {<Star weight={meeting.isStarred ? "Bold" : "Outline"} />}
              {meeting.isStarred ? "Remove star" : "Star"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpenMove(true)}>
              <Hashtag />
              Move to channel
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpenRename(true)}>
              <Text />
              Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setOpenDelete(true)}
          >
            <TrashBin2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareMeetingDialog
        open={openShare}
        onOpenChange={setOpenShare}
        meeting={meeting}
      />
      <MoveMeeting
        open={openMove}
        onOpenChange={setOpenMove}
        meeting={meeting}
        onCreateChannel={createChannel}
      />
      <CreateChannelDialog open={openCreate} onOpenChange={setOpenCreate} />
      <RenameMeeting
        open={openRename}
        onOpenChange={setOpenRename}
        meeting={meeting}
      />
      <DeleteMeetingDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        meeting={meeting}
      />
    </div>
  )
}
