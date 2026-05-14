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

export function MeetingHostPopover() {
  const { data: members = [] } = useMembersQuery()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          className="flex-1 justify-between text-muted-foreground"
        >
          Any host
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-64 px-1">
        <PopoverHeader>
          <PopoverTitle className="px-3">Hosted by</PopoverTitle>
        </PopoverHeader>
        <Separator />
        <div className="flex items-center gap-2 px-3">
          <InputGroup className="bg-input">
            <InputGroupInput placeholder="search host" />
            <InputGroupAddon>
              <MinimalisticMagnifier />
            </InputGroupAddon>
          </InputGroup>
          <Button size="xs" variant="ghost">
            Clear all
          </Button>
        </div>
        <div>
          {members.map((host) => (
            <div
              key={host.id}
              className="flex items-center rounded-md p-3 hover:bg-secondary"
            >
              <div className="flex flex-1 items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={host.avatarUrl} />
                  <AvatarFallback>{host.initials}</AvatarFallback>
                </Avatar>
                <p className="line-clamp-1 text-sm font-medium text-popover-foreground">
                  {host.name}
                </p>
              </div>
              <Checkbox
                checked={host.isChecked}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
