"use client"

import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { ReactNode, useState } from "react"
import { ROLES } from "../../_lib/role-data"
import { getAssignableUiRoles, isProUiRole } from "../../_lib/role-utils"
import { useWorkspacePlan } from "@/hooks/use-workspace-plan"
import { UpgradeProDialog } from "../upgrade-pro-dialog"
import type { ApiWorkspaceRole } from "@workspace/types"

export function PeopleRoleDropdownMenu({
  onSelectRole,
  triggerButton,
  hasHeader = false,
  assignableOnly = false,
  actorRole,
  disabled = false,
}: {
  onSelectRole: (role: string) => void
  triggerButton: ReactNode
  hasHeader?: boolean
  assignableOnly?: boolean
  actorRole?: ApiWorkspaceRole
  disabled?: boolean
}) {
  const { isStudioPro } = useWorkspacePlan()
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const allowedIds = assignableOnly
    ? getAssignableUiRoles(actorRole)
    : ROLES.map((r) => r.id)

  const roles = ROLES.filter((item) => allowedIds.includes(item.id))

  const handleSelect = (roleId: string) => {
    if (!isStudioPro && isProUiRole(roleId)) {
      setUpgradeOpen(true)
      return
    }
    onSelectRole(roleId)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          {triggerButton}
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-fit">
          {hasHeader && (
            <>
              <DropdownMenuLabel className="py-2">
                Change role to
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}

          {roles.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onSelect={() => handleSelect(item.id)}
                  className="text-sm font-medium px-4 py-3 flex items-center justify-between gap-2"
                >
                  <span>{item.role}</span>

                  {item.isPro && (
                    <Badge variant="secondary">Pro</Badge>
                  )}
                </DropdownMenuItem>
              </TooltipTrigger>

              <TooltipContent side="right" className="border">
                <p className="max-w-xs text-xs">{item.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <UpgradeProDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  )
}
