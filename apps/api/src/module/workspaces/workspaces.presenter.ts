import type { Workspace } from "@workspace/database"
import { resolveWorkspaceImageUrl } from "../../lib/workspace-avatar"

export function toWorkspaceSummary(workspace: Workspace) {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    image: resolveWorkspaceImageUrl(workspace.id, workspace.image),
  }
}
