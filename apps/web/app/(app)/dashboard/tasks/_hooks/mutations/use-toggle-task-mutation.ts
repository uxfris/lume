"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi } from "@workspace/api-client"

import type { TasksGroup } from "@workspace/types"
import { taskKeys } from "../../_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

function updateTaskCompletion(
  groups: TasksGroup[],
  taskId: string,
  isCompleted: boolean
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,

    tasks: group.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            isCompleted,
          }
        : task
    ),
  }))
}

export type ToggleTaskPayload = {
  id: string
  isCompleted: boolean
}

type useToggleTaskMutationReturn = {
  toggleTask: (payload: ToggleTaskPayload) => void
  toggleTaskAsync: (payload: ToggleTaskPayload) => Promise<any>
  loading: boolean
}

export function useToggleTaskMutation(): useToggleTaskMutationReturn {
  const { workspaceId } = useCurrentWorkspace()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      taskApi.toggle(id, isCompleted),

    onMutate: async ({ id, isCompleted }) => {
      console.log(`toggle: ${id}\n${isCompleted}`)
      await queryClient.cancelQueries({
        queryKey: taskKeys.lists(workspaceId),
      })

      const previousLists = queryClient.getQueriesData<TasksGroup[]>({
        queryKey: taskKeys.lists(workspaceId),
      })

      previousLists.forEach(([queryKey, groups]) => {
        if (!groups) return

        queryClient.setQueryData<TasksGroup[]>(
          queryKey,
          updateTaskCompletion(groups, id, isCompleted)
        )
      })

      return {
        previousLists,
      }
    },

    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(workspaceId),
      })
    },
  })

  return {
    toggleTask: mutation.mutate,
    toggleTaskAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
