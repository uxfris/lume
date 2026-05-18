"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"
import { IntegrationSettingItem } from "../../_components/integration-setting-item"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { LinearIntegrationConfig } from "@workspace/types"
import { integrationsApi } from "@workspace/api-client"
import { useQueryClient } from "@tanstack/react-query"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { integrationsKeys } from "../../../_lib/integrations.keys"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"

export function IntegrationLinearSettings({
  config,
}: {
  config: LinearIntegrationConfig
}) {
  const queryClient = useQueryClient()
  const { workspaceId } = useCurrentWorkspace()
  const [draft, setDraft] = useState(config)

  useEffect(() => {
    setDraft(config)
  }, [config])

  async function patchSettings(patch: Partial<LinearIntegrationConfig>) {
    const previous = draft
    setDraft((current) => ({ ...current, ...patch }))
    try {
      await integrationsApi.patchLinearSettings(patch)
      await queryClient.invalidateQueries({
        queryKey: integrationsKeys.detail(workspaceId, "linear"),
      })
    } catch {
      setDraft(previous)
      toast.error("Could not save settings")
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs text-muted-foreground uppercase">Settings</h2>
      <Card>
        <CardContent className="space-y-4">
          <IntegrationSettingItem
            id="auto-create-issues"
            label="Auto-create issues"
            description="Create an issue from every action item"
            trailing={
              <Switch
                checked={draft.autoCreateIssues}
                onCheckedChange={(checked) =>
                  patchSettings({ autoCreateIssues: checked })
                }
              />
            }
          />

          <Separator />

          <IntegrationSettingItem
            id="auto-assign"
            label="Auto-assign to participants"
            description="Match names to workspace members"
            trailing={
              <Switch
                checked={draft.autoAssignParticipants}
                onCheckedChange={(checked) =>
                  patchSettings({ autoAssignParticipants: checked })
                }
              />
            }
          />

          <Separator />

          <IntegrationSettingItem
            id="auto-due-date"
            label="Automatically set due date"
            description="Based on deadlines mentioned in the meeting"
            trailing={
              <Switch
                checked={draft.autoSetDueDate}
                onCheckedChange={(checked) =>
                  patchSettings({ autoSetDueDate: checked })
                }
              />
            }
          />

          <Separator />

          <IntegrationSettingItem
            id="default-priority"
            label="Default priority"
            description="For issues without urgency context"
            trailing={
              <>
                <div className="hidden items-center gap-2 md:flex">
                  {(["urgent", "medium", "low"] as const).map((priority) => (
                    <Button
                      key={priority}
                      variant={
                        draft.defaultPriority === priority
                          ? "secondary"
                          : "outline"
                      }
                      size="xs"
                      className="capitalize"
                      onClick={() =>
                        patchSettings({ defaultPriority: priority })
                      }
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
                <div className="md:hidden">
                  <Select
                    value={draft.defaultPriority}
                    onValueChange={(value) =>
                      patchSettings({
                        defaultPriority:
                          value as LinearIntegrationConfig["defaultPriority"],
                      })
                    }
                  >
                    <SelectTrigger size="sm" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </>
            }
          />

          <Separator />

          <IntegrationSettingItem
            id="default-project"
            label="Default team"
            description={draft.defaultTeamName ?? "First team in workspace"}
            trailing={
              <span className={cn("text-xs text-muted-foreground")}>
                {draft.defaultTeamName ? "Configured" : "Auto"}
              </span>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
