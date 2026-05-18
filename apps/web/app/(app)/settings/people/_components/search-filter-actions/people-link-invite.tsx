"use client"

import { ClockCircle, Link, Refresh, TrashBin2 } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ASSIGNABLE_UI_ROLES, isProUiRole } from "../../_lib/role-utils"
import { useInviteLinkQuery } from "../../_hooks/queries/use-invite-link-query"
import { useInviteLinkMutations } from "../../_hooks/mutations/use-invite-link-mutations"
import { useWorkspacePlan } from "@/hooks/use-workspace-plan"
import { UpgradeProDialog } from "../upgrade-pro-dialog"
import { formatDateOnly } from "@/lib/date-format"

export function PeopleLinkInvite() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string>("member")
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const { data: linkData } = useInviteLinkQuery()
  const { createInviteLink, regenerateInviteLink, revokeInviteLink, isPending } =
    useInviteLinkMutations()
  const { isStudioPro } = useWorkspacePlan()

  const activeLink = linkData?.link
  const displayUrl = inviteUrl
  const expiresLabel = activeLink
    ? formatDateOnly(activeLink.expiresAt)
    : inviteUrl
      ? null
      : null

  const handleRoleChange = (value: string) => {
    if (!isStudioPro && isProUiRole(value)) {
      setUpgradeOpen(true)
      return
    }
    setRole(value)
  }

  const createLink = async () => {
    if (!isStudioPro && isProUiRole(role)) {
      setUpgradeOpen(true)
      return
    }
    const result = await createInviteLink(role)
    setInviteUrl(result.url)
  }

  const regenerate = async () => {
    const result = await regenerateInviteLink(role)
    setInviteUrl(result.url)
    toast.success("Invite link regenerated")
  }

  const revoke = async () => {
    await revokeInviteLink()
    setInviteUrl(null)
    setOpen(false)
  }

  const copyLink = async () => {
    const url = inviteUrl ?? (activeLink ? undefined : undefined)
    if (!url) {
      toast.error("Create an invite link first")
      return
    }
    await navigator.clipboard.writeText(url)
    toast.success("Copied to clipboard")
  }

  const hasLink = Boolean(inviteUrl ?? activeLink)

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex-1" size="xs" variant="secondary">
            <Link />
            Invite link
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Workspace invite link</DialogTitle>
            <DialogDescription>
              Generate a link to invite people to this workspace. Links expire
              after 7 days.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void createLink()
            }}
          >
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ASSIGNABLE_UI_ROLES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            {!hasLink && (
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  Create invite link
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            )}
          </form>
          {hasLink && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Invite link
                  </p>
                  {inviteUrl ? (
                    <p className="text-xs text-muted-foreground break-all">
                      {inviteUrl}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Link is active. Regenerate to copy a new URL.
                    </p>
                  )}
                  {inviteUrl && (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => void copyLink()}
                    >
                      <Copy />
                      Copy
                    </Button>
                  )}
                </div>
                {expiresLabel && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ClockCircle />
                      Expires {expiresLabel}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="p-0 bg-transparent hover:bg-transparent"
                      disabled={isPending}
                      onClick={() => void regenerate()}
                    >
                      <Refresh />
                      Regenerate
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={() => void revoke()}
                >
                  <TrashBin2 />
                  Delete
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <UpgradeProDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  )
}
