"use client"

import { Input } from "@workspace/ui/components/input"
import { SettingSection } from "../../_components/setting-section"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

export function WorkspaceNameSetting() {
  const initialValue = "Fris's Lume"
  const [value, setValue] = useState(initialValue)

  const isDirty = value != initialValue

  const handleCancel = () => setValue(initialValue)

  const handleUpdate = () => {}

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
          />
          <p className="text-xs text-muted-foreground-2">14/50 characters</p>
        </div>
      </SettingSection>
      <UnsavedChangeAction
        visible={isDirty}
        onCancel={handleCancel}
        onUpdate={handleUpdate}
      />
    </>
  )
}

export function UnsavedChangeAction({
  visible,
  onCancel,
  onUpdate,
}: {
  visible: boolean
  onCancel: () => void
  onUpdate: () => void
}) {
  return (
    <div
      className={cn(
        "fixed right-10 left-10 rounded-lg bg-popover transition-all duration-300 ease-in-out",
        visible
          ? "bottom-8 opacity-100"
          : "pointer-events-none bottom-0 translate-y-full opacity-0"
      )}
    >
      <div className="flex items-center justify-between px-10 py-3">
        <Badge
          variant="secondary"
          className="bg-orange-200 p-3 dark:bg-orange-500"
        >
          Unsaved changes
        </Badge>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onUpdate}>Update</Button>
        </div>
      </div>
    </div>
  )
}
