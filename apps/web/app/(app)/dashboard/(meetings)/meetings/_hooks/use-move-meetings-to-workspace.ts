// use-move-to-workspace.ts

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { meetingApi } from "@workspace/api-client"
import { WorkspaceMembership } from "@workspace/types"

import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { useWorkspacesQuery } from "@/app/(app)/settings/workspace/_hooks/queries/use-workpsace-query"
import { useMeetingSelection } from "../_stores/meeting-selection-store"

export function useMoveToWorkspace() {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceMembership | null>(null)

  const { workspaceId } = useCurrentWorkspace()

  const { workspaces, activeWorkspace } = useWorkspacesQuery({
    workspaceId,
  })

  const selectedIds = useMeetingSelection((s) => s.selectedIds)
  const clearSelection = useMeetingSelection((s) => s.clearSelection)
  const setSelectionMode = useMeetingSelection((s) => s.setSelectionMode)

  const filteredWorkspaces = workspaces.filter(
    ({ id }) => id !== activeWorkspace?.id
  )

  const moveToWorkspace = async () => {
    if (!selectedWorkspace) return

    try {
      setLoading(true)

      await meetingApi.moveToWorkspace(selectedWorkspace.id, selectedIds)

      toast.success(
        `Meeting${selectedIds.length > 1 ? "s" : ""} moved successfully`
      )

      clearSelection()
      setSelectionMode(false)

      router.refresh()
      setOpen(false)
    } catch {
      toast.error(`Failed to move meeting${selectedIds.length > 1 ? "s" : ""}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (loading) return
    setOpen(nextOpen)
  }

  return {
    open,
    loading,
    selectedIds,
    selectedWorkspace,
    filteredWorkspaces,

    setSelectedWorkspace,
    moveToWorkspace,
    handleOpenChange,
  }
}
