"use client"

import { Input } from "@workspace/ui/components/input"
import { SettingSection } from "../../_components/setting-section"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { canManageMembers } from "@/lib/workspace-permissions"
import { UnsavedChangeAction } from "../../account/_components/account-name-setting"
import { useWorkspacesQuery } from "../_hooks/queries/use-workpsace-query"
import { useUpdateWorkspaceMutation } from "../_hooks/mutations/use-update-workspace-mutation"

const MAX_NAME_LENGTH = 120

export function WorkspaceNameSetting() {
  const { workspaceId } = useCurrentWorkspace()
  const { activeWorkspace } = useWorkspacesQuery({ workspaceId })
  const updateWorkspace = useUpdateWorkspaceMutation()

  const [savedName, setSavedName] = useState("")
  const [value, setValue] = useState("")

  const canEdit = canManageMembers(activeWorkspace?.role)

  useEffect(() => {
    const name = activeWorkspace?.name ?? ""
    setSavedName(name)
    setValue(name)
  }, [activeWorkspace?.name])

  const trimmedValue = value.trim()
  const isDirty = trimmedValue !== savedName
  const isValid =
    trimmedValue.length > 0 && trimmedValue.length <= MAX_NAME_LENGTH

  const handleCancel = () => setValue(savedName)

  const handleUpdate = async () => {
    if (!isValid || !isDirty || !canEdit) return

    try {
      const workspace = await updateWorkspace.update({ name: trimmedValue })
      setSavedName(workspace.name)
      setValue(workspace.name)
      toast.success("Updated workspace name", {
        description: "Your workspace name has been saved.",
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update workspace name"
      toast.error("Failed to update workspace name", { description: message })
    }
  }

  return (
    <>
      <SettingSection
        title="Name"
        description="Your full workspace name, as visible to others."
        borderBottom={false}
      >
        <div className="flex flex-col items-end gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter workspace name"
            className="h-10"
            maxLength={MAX_NAME_LENGTH}
            disabled={!canEdit || updateWorkspace.isPending}
          />
          <p className="text-xs text-muted-foreground-2">
            {trimmedValue.length}/{MAX_NAME_LENGTH} characters
          </p>
        </div>
      </SettingSection>
      {canEdit ? (
        <UnsavedChangeAction
          visible={isDirty}
          loading={updateWorkspace.isPending}
          disabled={!isValid}
          onCancel={handleCancel}
          onUpdate={handleUpdate}
        />
      ) : null}
    </>
  )
}
