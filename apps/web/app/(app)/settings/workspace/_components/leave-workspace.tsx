"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import { SettingSection } from "../../_components/setting-section"
import { cn } from "@workspace/ui/lib/utils"
import { LeaveWorkspaceDialog } from "./leave-workspace-dialog"
import { useWorkspacesQuery } from "../_hooks/queries/use-workpsace-query"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { usePeopleQuery } from "../../people/_hooks/queries/use-people-query"

export function LeaveWorkspace() {
  const { workspaceId } = useCurrentWorkspace()
  const { workspaces, activeWorkspace } = useWorkspacesQuery({ workspaceId })
  const { data: members = [] } = usePeopleQuery()

  const isLastWorkspace = workspaces.length <= 1
  const ownerCount = members.filter((m) => m.role === "owner").length
  const isOnlyOwner =
    activeWorkspace?.role === "OWNER" && ownerCount <= 1
  const canLeave = !isLastWorkspace && !isOnlyOwner

  let description = ""

  if (isLastWorkspace) {
    description =
      "You cannot leave your last workspace. Your account must be a member of at least one workspace."
  } else if (isOnlyOwner) {
    description =
      "You cannot leave because you are the only owner. Please assign another owner first."
  } else {
    description =
      "You can leave the workspace. Other owners will maintain access."
  }

  return (
    <Card className="py-2">
      <CardContent className={cn("px-5", !canLeave && "opacity-80")}>
        <SettingSection
          title="Leave workspace"
          description={description}
          borderBottom={false}
        >
          <LeaveWorkspaceDialog canLeave={canLeave} />
        </SettingSection>
      </CardContent>
    </Card>
  )
}
