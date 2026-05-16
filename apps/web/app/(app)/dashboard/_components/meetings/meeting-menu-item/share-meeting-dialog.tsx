"use client"

import {
  Global,
  Hourglass,
  LinkMinimalistic,
  MinimalisticMagnifier,
} from "@solar-icons/react"
import type { Meeting } from "@workspace/types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useShareMeeting } from "@/app/(app)/dashboard/_hooks/use-share-meeting"
import {
  generalAccessToSelectValue,
  selectValueToGeneralAccess,
  selectValueToShareRole,
  shareRoleLabel,
  shareRoleToSelectValue,
} from "@/app/(app)/dashboard/_lib/meeting-share"

export function ShareMeetingDialog({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: Meeting
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {
    share,
    isLoading,
    isError,
    inviteInput,
    setInviteInput,
    submitInvites,
    isInviting,
    updateCollaboratorRole,
    removeCollaborator,
    updateGeneralAccess,
    isUpdatingAccess,
    copyShareLink,
  } = useShareMeeting({ meeting, open })

  const canManage = share?.canManage ?? false
  const collaborators = share?.collaborators ?? []
  const isOwner = collaborators.some((c) => c.isOwner && c.isCurrentUser)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-md">
        <DialogHeader>
          <DialogTitle>Share meeting</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="share">
          <TabsList variant="line" className="w-full justify-start gap-6">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>
          <TabsContent value="share" className="space-y-2 pt-4">
            {canManage && (
              <div className="flex items-center gap-3">
                <InputGroup autoFocus className="bg-input border-2 border-primary">
                  <InputGroupInput
                    placeholder="Email or group, separated by comma"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        submitInvites()
                      }
                    }}
                    disabled={isInviting}
                  />
                  <InputGroupAddon>
                    <MinimalisticMagnifier />
                  </InputGroupAddon>
                </InputGroup>
                <Button
                  size="xs"
                  onClick={submitInvites}
                  disabled={isInviting || !inviteInput.trim()}
                >
                  {isInviting ? "Sending…" : "Invite"}
                </Button>
              </div>
            )}
            <div className="space-y-3 pt-2">
              <div className="overflow-y-auto max-h-48 space-y-1">
                {isLoading &&
                  [0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-2 py-2">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                {isError && (
                  <p className="text-xs text-destructive py-4 text-center">
                    Could not load sharing settings.
                  </p>
                )}
                {!isLoading &&
                  !isError &&
                  collaborators.map((person) => (
                    <div key={person.id} className="flex items-center rounded-md">
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        <Avatar>
                          {person.avatarUrl ? (
                            <AvatarImage src={person.avatarUrl} alt="" />
                          ) : null}
                          <AvatarFallback>{person.avatarInitials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-popover-foreground line-clamp-1">
                            {person.name ?? person.email}
                            {person.isCurrentUser ? " (You)" : ""}
                            {person.isOwner ? " · Owner" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {person.email}
                          </p>
                        </div>
                      </div>
                      {person.isOwner ? (
                        <span className="text-xs text-muted-foreground px-2">
                          Owner
                        </span>
                      ) : canManage ? (
                        <Select
                          value={shareRoleToSelectValue(person.role)}
                          onValueChange={(value) => {
                            if (value === "remove") {
                              removeCollaborator(person.id)
                              return
                            }
                            updateCollaboratorRole(
                              person.id,
                              selectValueToShareRole(value)
                            )
                          }}
                        >
                          <SelectTrigger className="border-none w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="edit">Can edit</SelectItem>
                              <SelectItem value="view">Can view</SelectItem>
                              <SelectItem value="remove" className="text-destructive">
                                Remove
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground px-2">
                          {shareRoleLabel(person.role)}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="embed" className="pt-8">
            <div className="flex flex-col items-center justify-center gap-4 h-[220px] bg-background rounded-md">
              <Hourglass size={36} />
              <p className="text-sm text-muted-foreground text-center">
                This functionality will be <br /> available in the next release.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex flex-1 items-center min-w-0">
            <div className="flex items-center justify-center p-1.5 border border-border rounded-md shrink-0">
              <Global />
            </div>
            <Select
              value={
                share
                  ? generalAccessToSelectValue(share.generalAccess)
                  : "owner"
              }
              onValueChange={(value) =>
                updateGeneralAccess(selectValueToGeneralAccess(value))
              }
              disabled={!isOwner || isUpdatingAccess || isLoading}
            >
              <SelectTrigger className="border-none min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="team-anyone">
                    Teammates & anyone with link
                  </SelectItem>
                  <SelectItem value="teammates">Teammates</SelectItem>
                  <SelectItem value="owner">Only people invited</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => void copyShareLink()}
            disabled={!share?.shareUrl}
          >
            <LinkMinimalistic />
            Copy link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
