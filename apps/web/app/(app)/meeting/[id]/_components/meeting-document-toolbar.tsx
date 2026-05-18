"use client"

import { CreateChannelDialog } from "@/app/(app)/dashboard/(meetings)/meetings/_components/create-channel-dialog"
import { MoveMeeting } from "@/app/(app)/dashboard/_components/meetings/meeting-menu-item/move-meeting-dialog"
import { RenameMeeting } from "@/app/(app)/dashboard/_components/meetings/meeting-menu-item/rename-meeting-dialog"
import { ShareMeetingDialog } from "@/app/(app)/dashboard/_components/meetings/meeting-menu-item/share-meeting-dialog"
import { buildMeetingShareUrl } from "@/app/(app)/dashboard/_lib/meeting-share"
import { CopyButton } from "@/components/copy-button"
import { CreditLeftCard } from "@/components/credit-left-card"
import { formatEditedLabel } from "@/lib/date-format"
import { routes } from "@/lib/routes"
import { Hashtag } from "@solar-icons/react"
import {
  AltArrowDown,
  AltArrowLeft,
  InfoCircle,
  Pen,
  Share,
  Star,
} from "@solar-icons/react/ssr"
import { meetingApi } from "@workspace/api-client"
import { Meeting } from "@workspace/types"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { MeetingDetailsDialog } from "./meeting-details-dialog"

export function MeetingDocumentToolbar({ meeting }: { meeting: Meeting }) {
  const router = useRouter()

  const [openShare, setOpenShare] = useState(false)
  const [openMove, setOpenMove] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [openRename, setOpenRename] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [isStarred, setIsStarred] = useState(meeting.isStarred)

  useEffect(() => {
    setIsStarred(meeting.isStarred)
  }, [meeting.isStarred])

  const meetingUrl = useMemo(() => {
    const fromEnv = buildMeetingShareUrl(meeting.id)
    if (fromEnv.startsWith("http")) return fromEnv
    if (typeof window !== "undefined") {
      return `${window.location.origin}${routes.meeting(meeting.id)}`
    }
    return routes.meeting(meeting.id)
  }, [meeting.id])

  const createChannel = () => {
    setOpenMove(false)
    setOpenCreate(true)
  }

  const toggleStar = async () => {
    const nextStarred = !isStarred
    setIsStarred(nextStarred)
    try {
      await meetingApi.updateMeeting(meeting.id, { isStarred: nextStarred })
      toast.success(
        nextStarred ? "Meeting starred" : "Meeting unstarred"
      )
      router.refresh()
    } catch {
      setIsStarred(!nextStarred)
      toast.error("Failed to update star")
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 w-full bg-card">
        <div className="flex items-center justify-between gap-5 px-5 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 py-2">
              <span className="line-clamp-1 text-start text-sm font-medium">
                {meeting.title}
              </span>
              <AltArrowDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-2 sm:min-w-56">
              <Link href={routes.dashboard.root}>
                <DropdownMenuItem>
                  <AltArrowLeft />
                  Go to Dashboard
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <div className="flex items-center gap-2 p-1">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-center text-xs font-medium text-primary-foreground!"
                  aria-hidden="true"
                >
                  F
                </span>
                <span className="text-xs">Fris's Lume</span>
                <Badge variant="secondary">Free</Badge>
              </div>
              <CreditLeftCard />
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="space-y-1 text-sm font-medium text-popover-foreground">
                <DropdownMenuItem onSelect={() => setOpenShare(true)}>
                  <Share />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void toggleStar()}>
                  <Star weight={isStarred ? "Bold" : "Outline"} />
                  {isStarred ? "Remove star" : "Star Meeting"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setOpenRename(true)}>
                  <Pen />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setOpenMove(true)}>
                  <Hashtag />
                  Move to channel
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setOpenDetails(true)}>
                  <InfoCircle />
                  Details
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-1">
            <span className="hidden px-4 text-sm font-medium text-muted-foreground-2 md:block">
              {formatEditedLabel(meeting.updatedAt)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenShare(true)}
            >
              Share
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <CopyButton content={meetingUrl} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy link</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void toggleStar()}
                  aria-label={isStarred ? "Remove star" : "Star meeting"}
                >
                  <Star
                    weight={isStarred ? "Bold" : "Outline"}
                    className={cn(isStarred && "text-primary")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isStarred ? "Remove star" : "Star meeting"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      <ShareMeetingDialog
        open={openShare}
        onOpenChange={setOpenShare}
        meeting={meeting}
      />
      <RenameMeeting
        open={openRename}
        onOpenChange={setOpenRename}
        meeting={meeting}
      />
      <MoveMeeting
        open={openMove}
        onOpenChange={setOpenMove}
        meeting={meeting}
        onCreateChannel={createChannel}
      />
      <CreateChannelDialog open={openCreate} onOpenChange={setOpenCreate} />
      <MeetingDetailsDialog
        open={openDetails}
        onOpenChange={setOpenDetails}
        meeting={meeting}
      />
    </>
  )
}
