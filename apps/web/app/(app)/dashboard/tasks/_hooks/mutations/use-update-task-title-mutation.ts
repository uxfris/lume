"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi } from "@workspace/api-client"

import type { ActionItem, TasksGroup } from "@workspace/types"
import {
  updateTaskTitleInGroups,
  updateTaskTitleInMeetingTasks,
} from "../../_lib/task-cache"
import { taskKeys } from "../../_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

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
  const { workspaceId } = useCurrentWorkspace()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      taskApi.updateTitle(id, title),

    onMutate: async ({ id, title }) => {
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
          updateTaskTitleInGroups(groups, id, title)
        )
      })

      previousMeetingTasks.forEach(([queryKey, tasks]) => {
        if (!tasks) return

        queryClient.setQueryData<ActionItem[]>(
          queryKey,
          updateTaskTitleInMeetingTasks(tasks, id, title)
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

      toast.error("Failed to update task title.")
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.all(workspaceId),
      })
    },
  })

  return {
    updateTask: mutation.mutate,
    updateTaskAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
