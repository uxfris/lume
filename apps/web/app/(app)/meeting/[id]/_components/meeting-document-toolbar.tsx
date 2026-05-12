"use client"

import { CreateChannelDialog } from "@/app/(app)/dashboard/(meetings)/meetings/_components/create-channel-dialog"
import { MoveMeeting } from "@/app/(app)/dashboard/_components/meetings/meeting-menu-item/move-meeting-dialog"
import { RenameMeeting } from "@/app/(app)/dashboard/_components/meetings/meeting-menu-item/rename-meeting-dialog"
import { ShareMeetingDialog } from "@/app/(app)/dashboard/_components/meetings/meeting-menu-item/share-meeting-dialog"
import { CopyButton } from "@/components/copy-button"
import { CreditLeftCard } from "@/components/credit-left-card"
import { Hashtag } from "@solar-icons/react"
import {
  AltArrowDown,
  AltArrowLeft,
  InfoCircle,
  LockKeyhole,
  Pen,
  Share,
  Star,
} from "@solar-icons/react/ssr"
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
import Link from "next/link"
import { useState } from "react"
import { MeetingDetailsDialog } from "./meeting-details-dialog"
import { routes } from "@/lib/routes"

export function MeetingDocumentToolbar({ meeting }: { meeting: Meeting }) {
  const [openShare, setOpenShare] = useState(false)
  const [openMove, setOpenMove] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [openRename, setOpenRename] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)

  const createChannel = () => {
    setOpenMove(false)
    setOpenCreate(true)
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
                {/* <DropdownMenuItem>
                                    <Restart />
                                    Regenerate Notes
                                </DropdownMenuItem> */}
                <DropdownMenuItem>
                  <Star />
                  Star Meeting
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
                {/* <DropdownMenuItem>
                                    <Download />
                                    Download
                                </DropdownMenuItem> */}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-1">
            <span className="hidden px-4 text-sm font-medium text-muted-foreground-2 md:block">
              Edited Mar 30
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenShare(true)}
            >
              Share
            </Button>
            <CopyButton content="" />
            <Button variant="ghost" size="icon-sm">
              <Star />
            </Button>
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
