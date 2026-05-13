"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi } from "@workspace/api-client"

import type { TasksGroup } from "@workspace/types"
import { taskKeys } from "../../_lib/task-query-keys"

function updateTaskTitleInGroups(
  groups: TasksGroup[],
  taskId: string,
  title: string
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,

    tasks: group.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            title,
          }
        : task
    ),
  }))
}

export type UpdateTaskPayload = {
  id: string
  title: string
}

type useUpdateTaskMutationReturn = {
  updateTask: (payload: UpdateTaskPayload) => void
  updateTaskAsync: (payload: UpdateTaskPayload) => void
  loading: boolean
}

export function useUpdateTaskTitleMutation(): useUpdateTaskMutationReturn {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      taskApi.updateTitle(id, title),

    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({
        queryKey: taskKeys.lists(),
      })

      const previousLists = queryClient.getQueriesData<TasksGroup[]>({
        queryKey: taskKeys.lists(),
      })

      previousLists.forEach(([queryKey, groups]) => {
        if (!groups) return

        queryClient.setQueryData<TasksGroup[]>(
          queryKey,
          updateTaskTitleInGroups(groups, id, title)
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

      toast.error("Failed to update task title.")
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      })
    },
  })

  return {
    updateTask: mutation.mutate,
    updateTaskAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
