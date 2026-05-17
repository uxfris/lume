import { Card, CardContent } from "@workspace/ui/components/card"
import { SettingSection } from "../../_components/setting-section"
import { cn } from "@workspace/ui/lib/utils"
import { LeaveWorkspaceDialog } from "./leave-workspace-dialog"

export function LeaveWorkspace() {
  const isLastWorkspace = true
  const isOnlyOwner = true
  const hasOtherOwners = false

  let description = ""

  if (isLastWorkspace) {
    description =
      "You cannot leave your last workspace. Your account must be a member of at least one workspace."
  } else if (isOnlyOwner) {
    description =
      "You cannot leave because you are the only owner. Please transfer ownership first."
  } else if (hasOtherOwners) {
    description =
      "You can leave the workspace. Other owners will maintain access."
  }

  return (
    <Card className="py-2">
      <CardContent className={cn("px-5", !hasOtherOwners && "opacity-80")}>
        <SettingSection
          title="Leave workspace"
          description={description}
          borderBottom={false}
        >
          <LeaveWorkspaceDialog hasOtherOwners={hasOtherOwners} />
        </SettingSection>
      </CardContent>
    </Card>
  )
}
