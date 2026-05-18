"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { SettingSection } from "../../_components/setting-section"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { canManageMembers } from "@/lib/workspace-permissions"
import { useWorkspacesQuery } from "../_hooks/queries/use-workpsace-query"
import { useUpdateWorkspaceMutation } from "../_hooks/mutations/use-update-workspace-mutation"
import {
  buildHandleSuggestions,
  isValidWorkspaceHandle,
  normalizeWorkspaceHandle,
} from "../_lib/workspace-handle"

const APP_HOST =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "").replace(
    /\/$/,
    ""
  ) || "lume.ai"

export function WorkspaceHandleSetting() {
  const { workspaceId } = useCurrentWorkspace()
  const { activeWorkspace } = useWorkspacesQuery({ workspaceId })
  const updateWorkspace = useUpdateWorkspaceMutation()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const canEdit = canManageMembers(activeWorkspace?.role)
  const savedHandle = activeWorkspace?.slug ?? ""
  const normalizedValue = normalizeWorkspaceHandle(value)
  const isDirty = normalizedValue !== savedHandle
  const isValid = isValidWorkspaceHandle(normalizedValue)

  const suggestions = useMemo(
    () => buildHandleSuggestions(activeWorkspace?.name ?? ""),
    [activeWorkspace?.name]
  )

  useEffect(() => {
    if (open) {
      setValue(savedHandle)
    }
  }, [open, savedHandle])

  const handleSave = async () => {
    if (!isValid || !isDirty || !canEdit) return

    try {
      await updateWorkspace.update({ slug: normalizedValue })
      toast.success("Updated workspace handle", {
        description: `Your workspace is now @${normalizedValue}.`,
      })
      setOpen(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update workspace handle"
      toast.error("Failed to update workspace handle", { description: message })
    }
  }

  const previewHandle = normalizedValue || "yourusername"

  return (
    <SettingSection
      title="Workspace handle"
      description="Set a handle for the workspace profile page."
      borderBottom={false}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            disabled={!canEdit}
          >
            {savedHandle ? `@${savedHandle}` : "Set handle"}
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-hidden p-0">
          <DialogHeader>
            <DialogTitle asChild>
              <div className="pointer-events-none relative flex h-40 w-full items-center justify-center bg-accent">
                <div className="absolute inset-0">
                  <Image
                    src="/vectors/dialog-header-background.svg"
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="z-10 font-medium">
                  {APP_HOST}/@{previewHandle}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8 px-10 py-3">
            <Field>
              <FieldLabel
                htmlFor="workspace-handle"
                className="mb-1 text-base font-semibold normal-case text-foreground"
              >
                Set your workspace handle
              </FieldLabel>
              <InputGroup className="h-12 bg-input">
                <InputGroupInput
                  id="workspace-handle"
                  placeholder="username"
                  value={value}
                  onChange={(e) =>
                    setValue(normalizeWorkspaceHandle(e.target.value))
                  }
                  maxLength={20}
                  disabled={updateWorkspace.isPending}
                />
                <InputGroupAddon>
                  <p className="text-muted-foreground-2">@</p>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription className="text-xs text-muted-foreground-2">
                {normalizedValue.length}/20 characters (letters, numbers or _)
              </FieldDescription>
            </Field>
            {suggestions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Suggestions
                </p>
                <div className="flex items-center justify-between gap-3">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      className="flex-1 rounded-full"
                      variant="secondary"
                      onClick={() => setValue(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter className="px-16 pb-12">
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="ghost" disabled={updateWorkspace.isPending}>
                  Close
                </Button>
              </DialogClose>
              <Button
                onClick={handleSave}
                disabled={!isValid || !isDirty || updateWorkspace.isPending}
              >
                {updateWorkspace.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingSection>
  )
}
