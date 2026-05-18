"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import { getInitial } from "@/lib/get-initial"
import { resolveWorkspaceImageSrc } from "@/lib/workspace-avatar"
import type { WorkspaceMembership } from "@workspace/types"

type WorkspaceAvatarProps = {
  workspace: Pick<WorkspaceMembership, "id" | "name" | "image">
  className?: string
}

export function WorkspaceAvatar({ workspace, className }: WorkspaceAvatarProps) {
  const image = resolveWorkspaceImageSrc(workspace.id, workspace.image)

  return (
    <Avatar key={workspace.id} className={cn("rounded-[4px]", className)}>
      {image ? (
        <AvatarImage
          key={image}
          src={image}
          alt={workspace.name}
          className="rounded-[4px] object-cover"
        />
      ) : null}
      <AvatarFallback className="rounded-[4px] bg-primary text-xs font-medium text-primary-foreground">
        {getInitial(workspace.name)}
      </AvatarFallback>
    </Avatar>
  )
}
