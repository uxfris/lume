import { Card, CardContent } from "@workspace/ui/components/card"
import { WorkspaceAvatarSetting } from "./_components/workspace-avatar-setting"
import { WorkspaceNameSetting } from "./_components/workspace-name-setting"
import { WorkspaceHandleSetting } from "./_components/workspace-handle-setting"
import { LeaveWorkspace } from "./_components/leave-workspace"
import { SettingHeader } from "../_components/setting-header"

export default function Workspace() {
  return (
    <div className="flex flex-col gap-4 px-4 py-20 md:gap-8 md:p-12">
      <SettingHeader
        title="Workspace settings"
        description="Workspace allow you to collaborate on projects in real time."
      />
      <Card className="py-2">
        <CardContent className="px-5">
          <WorkspaceAvatarSetting />
          <WorkspaceNameSetting />
          {/* <WorkspaceHandleSetting /> */}
        </CardContent>
      </Card>
      <LeaveWorkspace />
    </div>
  )
}
