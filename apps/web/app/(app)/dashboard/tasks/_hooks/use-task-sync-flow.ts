"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { ActionItem, TaskSyncSelectionMode } from "@workspace/types"
import { authClient } from "@/lib/auth-client"

export function useTaskSyncFlow({
  tasks,
  meetingTitle,
}: {
  tasks: ActionItem[]
  meetingTitle: string
}) {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const [taskSelectionOpen, setTaskSelectionOpen] = useState(false)
  const [taskSendOpen, setTaskSendOpen] = useState(false)
  const [selectionMode, setSelectionMode] =
    useState<TaskSyncSelectionMode>("select")
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const myTasks = useMemo(
    () => tasks.filter((task) => task.assignee?.id === userId),
    [tasks, userId]
  )

  const selectionTasks = selectionMode === "mine" ? myTasks : tasks

  const initialSelectedTasksIds = useMemo(() => {
    if (selectionMode === "select") return undefined
    return selectionTasks.map((task) => task.id)
  }, [selectionMode, selectionTasks])

  const tasksToSend = useMemo(
    () => tasks.filter((task) => selectedTaskIds.includes(task.id)),
    [tasks, selectedTaskIds]
  )

  function openTaskSelection(mode: TaskSyncSelectionMode) {
    if (mode === "mine" && myTasks.length === 0) {
      toast.message("No tasks are assigned to you in this group.")
      return
    }
    if (mode !== "mine" && tasks.length === 0) {
      toast.message("No tasks available to sync.")
      return
    }

    setSelectionMode(mode)
    setTaskSelectionOpen(true)
  }

  function onContinue(ids: string[]) {
    if (ids.length === 0) {
      toast.error("Select at least one task to sync.")
      return
    }
    setSelectedTaskIds(ids)
    setTaskSelectionOpen(false)
    setTaskSendOpen(true)
  }

  function onSendSuccess(created: number) {
    setTaskSendOpen(false)
    setSelectedTaskIds([])
    if (created === 0) {
      toast.message("No Linear issues were created.")
      return
    }
    toast.success(
      created === 1
        ? "1 task sent to Linear"
        : `${created} tasks sent to Linear`
    )
  }

  return {
    taskSelectionOpen,
    setTaskSelectionOpen,
    taskSendOpen,
    setTaskSendOpen,
    openTaskSelection,
    selectionTasks,
    initialSelectedTasksIds,
    tasksToSend,
    meetingTitle,
    onContinue,
    onSendSuccess,
  }
}
