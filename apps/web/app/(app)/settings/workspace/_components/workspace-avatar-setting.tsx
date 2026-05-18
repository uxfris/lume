"use client"

import { Pen } from "@solar-icons/react"
import { SettingSection } from "../../_components/setting-section"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { toast } from "sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { useRef } from "react"
import { Spinner } from "@workspace/ui/components/spinner"
import { getInitial } from "@/lib/get-initial"
import { resolveWorkspaceImageSrc } from "@/lib/workspace-avatar"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { canManageMembers } from "@/lib/workspace-permissions"
import { useWorkspacesQuery } from "../_hooks/queries/use-workpsace-query"
import { useUpdateWorkspaceAvatarMutation } from "../_hooks/mutations/use-update-workspace-avatar-mutation"

export function WorkspaceAvatarSetting() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { workspaceId } = useCurrentWorkspace()
  const { activeWorkspace } = useWorkspacesQuery({ workspaceId })
  const updateAvatar = useUpdateWorkspaceAvatarMutation()

  const canEdit = canManageMembers(activeWorkspace?.role)
  const name = activeWorkspace?.name ?? "Workspace"
  const image =
    workspaceId != null
      ? resolveWorkspaceImageSrc(workspaceId, activeWorkspace?.image)
      : undefined

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (!file || !canEdit) return

    try {
      await updateAvatar.update(file)
      toast.success("Updated workspace avatar", {
        description: "Successfully uploaded new workspace avatar",
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update workspace avatar"
      toast.error("Failed to update workspace avatar", { description: message })
    }
  }

  const loading = updateAvatar.isPending

  return (
    <SettingSection
      title="Avatar"
      description="Set an avatar for your workspace."
      className="flex-row"
    >
      <div className="relative h-10 w-10 overflow-hidden rounded-sm">
        <Avatar className="flex h-full w-full items-center justify-center">
          {image ? <AvatarImage src={image} alt={name} /> : null}
          <AvatarFallback className="rounded-sm bg-primary text-sm font-medium text-primary-foreground">
            {getInitial(name)}
          </AvatarFallback>
        </Avatar>
        {loading ? (
          <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/80">
            <Spinner className="size-5 text-background" />
          </div>
        ) : null}
        {canEdit ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={loading}
            />
            <TooltipProvider delayDuration={600}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/80 opacity-0 hover:opacity-100 disabled:cursor-not-allowed"
                  >
                    <Pen className="text-primary-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Upload a new workspace avatar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : null}
      </div>
    </SettingSection>
  )
}
