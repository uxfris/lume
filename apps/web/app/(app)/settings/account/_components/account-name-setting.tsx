"use client"

import { Input } from "@workspace/ui/components/input"
import { SettingSection } from "../../_components/setting-section"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { useEffect, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useUpdateAccountNameMutation } from "../_hooks/use-update-account-name-mutation"

const MAX_NAME_LENGTH = 120

export function AccountNameSetting() {
  const { data: session } = authClient.useSession()
  const updateName = useUpdateAccountNameMutation()

  const [savedName, setSavedName] = useState("")
  const [value, setValue] = useState("")

  useEffect(() => {
    const name = session?.user.name ?? ""
    setSavedName(name)
    setValue(name)
  }, [session?.user.name])

  const trimmedValue = value.trim()
  const isDirty = trimmedValue !== savedName
  const isValid =
    trimmedValue.length > 0 && trimmedValue.length <= MAX_NAME_LENGTH

  const handleCancel = () => setValue(savedName)

  const handleUpdate = async () => {
    if (!isValid || !isDirty) return

    try {
      const user = await updateName.update(trimmedValue)
      setSavedName(user.name)
      setValue(user.name)
      toast.success("Updated name", {
        description: "Your profile name has been saved.",
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update name"
      toast.error("Failed to update name", { description: message })
    }
  }

  return (
    <>
      <SettingSection
        title="Full Name"
        description="The name that appears on your profile."
      >
        <div className="flex flex-col items-end gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your full name"
            className="h-12"
            maxLength={MAX_NAME_LENGTH}
            disabled={updateName.isPending}
          />
          <p className="text-xs text-muted-foreground-2">
            {trimmedValue.length}/{MAX_NAME_LENGTH} characters
          </p>
        </div>
      </SettingSection>
      <UnsavedChangeAction
        visible={isDirty}
        loading={updateName.isPending}
        disabled={!isValid}
        onCancel={handleCancel}
        onUpdate={handleUpdate}
      />
    </>
  )
}

export function UnsavedChangeAction({
  visible,
  loading,
  disabled,
  onCancel,
  onUpdate,
}: {
  visible: boolean
  loading?: boolean
  disabled?: boolean
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
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={disabled || loading}>
            {loading ? "Updating…" : "Update"}
          </Button>
        </div>
      </div>
    </div>
  )
}
