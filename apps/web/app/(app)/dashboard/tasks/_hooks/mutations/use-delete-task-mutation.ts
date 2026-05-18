"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi } from "@workspace/api-client"

import type { ActionItem, TasksGroup } from "@workspace/types"
import { taskKeys } from "../../_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

function removeTaskFromGroups(
  groups: TasksGroup[],
  taskId: string
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,

    tasks: group.tasks.filter((task) => task.id !== taskId),
  }))
}

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
        queryKey: taskKeys.lists(workspaceId),
      })
      queryClient.invalidateQueries({
        queryKey: taskKeys.insight(workspaceId),
      })
    },
  })

  function deleteTask(task: ActionItem) {
    const previousLists = queryClient.getQueriesData<TasksGroup[]>({
      queryKey: taskKeys.lists(workspaceId),
    })

    // optimistic remove
    previousLists.forEach(([queryKey, groups]) => {
      if (!groups) return

      queryClient.setQueryData<TasksGroup[]>(
        queryKey,
        removeTaskFromGroups(groups, task.id)
      )
    })

    let undone = false

    const timeout = setTimeout(() => {
      if (undone) return

      mutation.mutate(task.id, {
        onError: () => {
          // rollback
          previousLists.forEach(([queryKey, data]) => {
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
        },
      },
    })
  }

  return {
    deleteTask,

    loading: mutation.isPending,
  }
}
