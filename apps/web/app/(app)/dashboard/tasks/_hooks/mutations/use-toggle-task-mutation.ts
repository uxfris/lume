"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi } from "@workspace/api-client"

import type { ActionItem, TasksGroup } from "@workspace/types"
import {
  updateTaskCompletionInGroups,
  updateTaskCompletionInMeetingTasks,
} from "../../_lib/task-cache"
import { taskKeys } from "../../_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

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
      await queryClient.cancelQueries({
        queryKey: taskKeys.all(workspaceId),
      })

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
          updateTaskCompletionInGroups(groups, id, isCompleted)
        )
      })

      previousMeetingTasks.forEach(([queryKey, tasks]) => {
        if (!tasks) return

        queryClient.setQueryData<ActionItem[]>(
          queryKey,
          updateTaskCompletionInMeetingTasks(tasks, id, isCompleted)
        )
      })

      return {
        previousLists,
        previousMeetingTasks,
      }
    },

    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })

      context?.previousMeetingTasks.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })

      toast.error("Failed to update task.")
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.all(workspaceId),
      })
      queryClient.invalidateQueries({
        queryKey: taskKeys.insight(workspaceId),
      })
      queryClient.invalidateQueries({
        queryKey: taskKeys.productivity(workspaceId),
      })
    },
  })

  return {
    toggleTask: mutation.mutate,
    toggleTaskAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
