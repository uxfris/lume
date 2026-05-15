import { useMembersQuery } from "@/app/(app)/settings/people/_hooks/queries/use-members-query"
import { MinimalisticMagnifier } from "@solar-icons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Separator } from "@workspace/ui/components/separator"
import { ChevronDown } from "lucide-react"
import { useMemo, useState } from "react"
import { useMeetingListParticipantFilter } from "../../_stores/meeting-list-participant-filter-store"
import { cn } from "@workspace/ui/lib/utils"

function participantFilterLabel(
  selectedIds: string[],
  members: { id: string; name: string }[]
) {
  if (selectedIds.length === 0) return "Any participant"
  if (selectedIds.length === 1) {
    const name = members.find((m) => m.id === selectedIds[0])?.name
    return name ? name : "1 participant"
  }
  return `${selectedIds.length} participants`
}

export function MeetingParticipantPopover() {
  const { data: members = [] } = useMembersQuery()
  const [participantSearch, setParticipantSearch] = useState("")

  const selectedParticipantIds = useMeetingListParticipantFilter(
    (s) => s.selectedParticipantIds
  )
  const toggleParticipatId = useMeetingListParticipantFilter(
    (s) => s.toggleParticipantId
  )
  const clearParticipantFilter = useMeetingListParticipantFilter(
    (s) => s.clearParticipantFilter
  )

  const filteredMembers = useMemo(() => {
    const q = participantSearch.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => m.name.toLowerCase().includes(q))
  }, [members, participantSearch])

  const triggerLabel = participantFilterLabel(selectedParticipantIds, members)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          className={cn(
            "flex-1 justify-between gap-1 text-muted-foreground",
            selectedParticipantIds.length > 0 && "bg-accent-3"
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-72 px-1">
        <PopoverHeader>
          <PopoverTitle className="px-3">Participants</PopoverTitle>
        </PopoverHeader>
        <Separator />
        <div className="flex items-center gap-2 px-3">
          <InputGroup className="bg-input">
            <InputGroupInput
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
              placeholder="search participants"
            />
            <InputGroupAddon>
              <MinimalisticMagnifier />
            </InputGroupAddon>
          </InputGroup>
          <Button
            size="xs"
            variant="ghost"
            className="shrink-0 px-2"
            disabled={selectedParticipantIds.length === 0}
            onClick={() => clearParticipantFilter()}
          >
            Clear all
          </Button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No members match your search
            </p>
          ) : (
            filteredMembers.map((participant) => {
              const checked = selectedParticipantIds.includes(participant.id)
              return (
                <div
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer items-center rounded-md p-3 outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                  key={participant.id}
                  onClick={() => toggleParticipatId(participant.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                      toggleParticipatId(participant.id)
                    }
                  }}
                >
                  <div className="flex flex-1 items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage src={participant.avatarUrl} />
                      <AvatarFallback>{participant.initials}</AvatarFallback>
                    </Avatar>
                    <p className="line-clamp-1 text-sm font-medium text-popover-foreground">
                      {participant.name}
                    </p>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleParticipatId(participant.id)}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
