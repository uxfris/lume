"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi } from "@workspace/api-client"

import type { ActionItem, TasksGroup } from "@workspace/types"
import {
  removeTaskFromGroups,
  removeTaskFromMeetingTasks,
} from "../../_lib/task-cache"
import { taskKeys } from "../../_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useDeleteTaskMutation() {
  const { workspaceId } = useCurrentWorkspace()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (taskId: string) => taskApi.remove(taskId),

    onError: () => {
      toast.error("Failed to delete task.")
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.all(workspaceId),
      })
    },
  })

  function deleteTask(task: ActionItem) {
    const previousLists = queryClient.getQueriesData<TasksGroup[]>({
      queryKey: taskKeys.lists(workspaceId),
    })

    const previousMeetingTasks = queryClient.getQueriesData<ActionItem[]>({
      queryKey: taskKeys.meetings(workspaceId),
    })

    previousLists.forEach(([queryKey, groups]) => {
      if (!groups) return

      queryClient.setQueryData<TasksGroup[]>(
        queryKey,
        removeTaskFromGroups(groups, task.id)
      )
    })

    previousMeetingTasks.forEach(([queryKey, tasks]) => {
      if (!tasks) return

      queryClient.setQueryData<ActionItem[]>(
        queryKey,
        removeTaskFromMeetingTasks(tasks, task.id)
      )
    })

    let undone = false

    const timeout = setTimeout(() => {
      if (undone) return

      mutation.mutate(task.id, {
        onError: () => {
          previousLists.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data)
          })

          previousMeetingTasks.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data)
          })

          toast.error("Failed to delete task.")
        },
      })
    }, 5000)

    toast("Task deleted", {
      position: "bottom-center",

      duration: 5000,

      action: {
        label: "Undo",

        onClick: () => {
          undone = true

          clearTimeout(timeout)

          previousLists.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data)
          })

          previousMeetingTasks.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data)
          })
        },
      },
    })
  }

  return {
    deleteTask,

    loading: mutation.isPending,
  }
}
