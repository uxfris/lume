"use client"

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
import { useMeetingListHostFilter } from "../../_stores/meeting-list-host-filter-store"
import { cn } from "@workspace/ui/lib/utils"

function hostFilterLabel(
  selectedIds: string[],
  members: { id: string; name: string }[]
): string {
  if (selectedIds.length === 0) return "Any host"
  if (selectedIds.length === 1) {
    const name = members.find((m) => m.id === selectedIds[0])?.name
    return name ? name : "1 host"
  }
  return `${selectedIds.length} hosts`
}

export function MeetingHostPopover() {
  const { data: members = [] } = useMembersQuery()
  const [hostSearch, setHostSearch] = useState("")

  const selectedHostIds = useMeetingListHostFilter((s) => s.selectedHostIds)
  const toggleHostId = useMeetingListHostFilter((s) => s.toggleHostId)
  const clearHostFilter = useMeetingListHostFilter((s) => s.clearHostFilter)

  const filteredMembers = useMemo(() => {
    const q = hostSearch.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => m.name.toLowerCase().includes(q))
  }, [members, hostSearch])

  const triggerLabel = hostFilterLabel(selectedHostIds, members)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={selectedHostIds.length > 0 ? "secondary" : "outline"}
          size="xs"
          className="flex-1 justify-between gap-1 text-muted-foreground"
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-64 px-1">
        <PopoverHeader>
          <PopoverTitle className="px-3">Hosted by</PopoverTitle>
        </PopoverHeader>
        <Separator />
        <div className="flex items-center gap-2 px-3 py-2">
          <InputGroup className="min-w-0 flex-1 bg-input">
            <InputGroupInput
              value={hostSearch}
              onChange={(e) => setHostSearch(e.target.value)}
              placeholder="Search host"
              aria-label="Search hosts"
            />
            <InputGroupAddon>
              <MinimalisticMagnifier />
            </InputGroupAddon>
          </InputGroup>
          <Button
            size="xs"
            variant="ghost"
            className="shrink-0 px-2"
            disabled={selectedHostIds.length === 0}
            onClick={() => clearHostFilter()}
          >
            Clear all
          </Button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No members match your search.
            </p>
          ) : (
            filteredMembers.map((host) => {
              const checked = selectedHostIds.includes(host.id)
              return (
                <div
                  key={host.id}
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer items-center rounded-md p-3 outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => toggleHostId(host.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleHostId(host.id)
                    }
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage src={host.avatarUrl} />
                      <AvatarFallback>{host.initials}</AvatarFallback>
                    </Avatar>
                    <p className="line-clamp-1 text-sm font-medium text-popover-foreground">
                      {host.name}
                    </p>
                  </div>
                  <div
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleHostId(host.id)}
                      aria-label={`Filter by ${host.name}`}
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
