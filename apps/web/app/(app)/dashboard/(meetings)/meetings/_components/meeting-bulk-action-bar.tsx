"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { useMeetingSelection } from "../_stores/meeting-selection-store"
import { Meeting } from "@workspace/types"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { SmartKbd } from "@/components/smart-kbd"
import { useShortcutRegister } from "@/components/shortcut-provider"
import { useEffect } from "react"
import { MoveToChannelDialog } from "./meeting-action/move-to-channel-dialog"
import { MoveToWorkspaceDialog } from "./meeting-action/move-to-workspace-dialog"
import { RemoveFromChannelDialog } from "./meeting-action/remove-from-channel-dialog"
import { DeleteMeetingsDialog } from "./meeting-action/delete-meetings-dialog"
import { usePathname, useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { meetingApi } from "@workspace/api-client"

export function MeetingBulkActionBar({
  isChannel,
  isStarred,
  meetings,
}: {
  isChannel?: boolean
  isStarred?: boolean
  meetings: Meeting[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  const selectionMode = useMeetingSelection((s) => s.selectionMode)
  const setSelectionMode = useMeetingSelection((s) => s.setSelectionMode)
  const selectedIds = useMeetingSelection((s) => s.selectedIds)
  const selectAll = useMeetingSelection((s) => s.selectAll)
  const clearSelection = useMeetingSelection((s) => s.clearSelection)

  const allIds = meetings.map((m) => m.id) // you must pass this in or lift it up
  const isAllSelected = selectedIds.length === allIds.length

  const { register } = useShortcutRegister()

  useEffect(() => {
    register("selectall", () =>
      selectionMode
        ? isAllSelected
          ? clearSelection()
          : selectAll(allIds)
        : {}
    )
  })

  useEffect(() => {
    clearSelection()
    setSelectionMode(false)
  }, [pathname])

  const unstarMeetings = async () => {
    clearSelection()
    setSelectionMode(false)
    await meetingApi.unstarMeetings(selectedIds)
    router.refresh()
  }

  if (selectionMode)
    return (
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-sm border border-border bg-popover p-2 shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-meetings"
                className="border-foreground"
                checked={isAllSelected}
                onCheckedChange={(checked) =>
                  checked ? selectAll(allIds) : clearSelection()
                }
              />
              <Label
                htmlFor="select-meetings"
                className="cursor-pointer text-xs whitespace-nowrap text-foreground normal-case hover:underline"
              >
                {selectedIds.length > 0
                  ? `${selectedIds.length} Selected`
                  : `Select all (${allIds.length})`}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <SmartKbd action={"selectall"} />
          </TooltipContent>
        </Tooltip>
        {selectedIds.length > 0 && (
          <>
            <VerticalDivider />
            {isStarred ? (
              <Button size="xs" variant="ghost" onClick={unstarMeetings}>
                <Star />
                Unstar
              </Button>
            ) : (
              <>
                {isChannel ? (
                  <RemoveFromChannelDialog
                    meetings={meetings}
                    selectedMeetingIds={selectedIds}
                  />
                ) : (
                  <MoveToChannelDialog meetingIds={selectedIds} />
                )}
                <MoveToWorkspaceDialog />
                <VerticalDivider />
                <DeleteMeetingsDialog
                  meetings={meetings}
                  selectedMeetingIds={selectedIds}
                />
              </>
            )}
            <VerticalDivider />
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                clearSelection()
              }}
            >
              Clear
            </Button>
          </>
        )}
        <VerticalDivider />
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            setSelectionMode(false)
            clearSelection()
          }}
        >
          Cancel
        </Button>
      </div>
    )
}

function VerticalDivider() {
  return <div className="h-5.5 w-px bg-border" />
}
