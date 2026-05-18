"use client"

import { UserPlus } from "@solar-icons/react"
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
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { parseInviteEmails } from "../../_lib/parse-invite-emails"
import { ASSIGNABLE_UI_ROLES, isProUiRole } from "../../_lib/role-utils"
import { toast } from "sonner"
import { useWorkspacePlan } from "@/hooks/use-workspace-plan"
import { UpgradeProDialog } from "../upgrade-pro-dialog"
import type { ApiWorkspaceRole } from "@workspace/types"

export function PeopleInviteMembers({
  onInvite,
  isPending = false,
  actorRole,
}: {
  onInvite?: (emails: string[], role: string) => void
  isPending?: boolean
  actorRole?: ApiWorkspaceRole
}) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("member")
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const { isStudioPro } = useWorkspacePlan()

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get("invite") === "true") {
      setOpen(true)

      const params = new URLSearchParams(searchParams.toString())
      params.delete("invite")
      router.replace(
        pathname + (params.toString() ? `?${params.toString()}` : ""),
        { scroll: false }
      )
    }
  }, [searchParams, pathname, router])

  const handleRoleChange = (value: string) => {
    if (!isStudioPro && isProUiRole(value)) {
      setUpgradeOpen(true)
      return
    }
    setRole(value)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!isStudioPro && isProUiRole(role)) {
      setUpgradeOpen(true)
      return
    }
    const emails = parseInviteEmails(email)
    if (emails.length === 0) {
      toast.error("Enter at least one valid email")
      return
    }
    onInvite?.(emails, role)
    setEmail("")
    setOpen(false)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1" size="xs">
          <UserPlus />
          Invite members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite members</DialogTitle>
          <DialogDescription>
            Invite members to your workspace by email
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              placeholder="example1@example.com, example2@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
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
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <UpgradeProDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  )
}
