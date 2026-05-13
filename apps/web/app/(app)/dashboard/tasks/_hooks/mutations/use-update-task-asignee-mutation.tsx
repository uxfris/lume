"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi } from "@workspace/api-client"

import type { TasksGroup, UserSummary } from "@workspace/types"
import { taskKeys } from "../../_lib/task-query-keys"

function updateTaskAssigneeInGroups(
  groups: TasksGroup[],
  taskId: string,
  assignee: UserSummary | null
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,

    tasks: group.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            assignee,
          }
        : task
    ),
  }))
}

export type UpdateTaskPayload = {
  id: string
  assignee: UserSummary | null
}

type useUpdateTaskMutationReturn = {
  updateTask: (payload: UpdateTaskPayload) => void
  updateTaskAsync: (payload: UpdateTaskPayload) => void
  loading: boolean
}

export function useUpdateTaskAssigneeMutation(): useUpdateTaskMutationReturn {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      id,
      assignee,
    }: {
      id: string
      assignee: UserSummary | null
    }) => taskApi.updateAssignee(id, assignee),

    onMutate: async ({ id, assignee }) => {
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
          updateTaskAssigneeInGroups(groups, id, assignee)
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

      toast.error("Failed to update assignee.")
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
