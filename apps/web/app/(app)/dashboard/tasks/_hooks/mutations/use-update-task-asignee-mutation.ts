"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi } from "@workspace/api-client"

import type { ActionItem, TasksGroup, UserSummary } from "@workspace/types"
import {
  updateTaskAssigneeInGroups,
  updateTaskAssigneeInMeetingTasks,
} from "../../_lib/task-cache"
import { taskKeys } from "../../_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

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
  const { workspaceId } = useCurrentWorkspace()

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
          updateTaskAssigneeInGroups(groups, id, assignee)
        )
      })

      previousMeetingTasks.forEach(([queryKey, tasks]) => {
        if (!tasks) return

        queryClient.setQueryData<ActionItem[]>(
          queryKey,
          updateTaskAssigneeInMeetingTasks(tasks, id, assignee)
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

      toast.error("Failed to update assignee.")
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
