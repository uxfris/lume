"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi, type CreateTaskInput } from "@workspace/api-client"

import type { ActionItem, TasksGroup, UserSummary } from "@workspace/types"
import {
  insertTaskIntoGroups,
  insertTaskIntoMeetingTasks,
  replaceOptimisticTaskInGroups,
  replaceOptimisticTaskInMeetingTasks,
} from "../../_lib/task-cache"
import { taskKeys } from "../../_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export type AddTaskPayload = {
  title: string
  assignee: UserSummary | null
  isCompleted: boolean
  meetingId: string | null
}

type useAddTaskMutationReturn = {
  addTask: (payload: AddTaskPayload) => void
  addTaskAsync: (payload: AddTaskPayload) => Promise<any>
  loading: boolean
}

export function useAddTaskMutation(): useAddTaskMutationReturn {
  const { workspaceId } = useCurrentWorkspace()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: CreateTaskInput) => taskApi.add(input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: taskKeys.all(workspaceId),
      })

      const previousLists = queryClient.getQueriesData<TasksGroup[]>({
        queryKey: taskKeys.lists(workspaceId),
      })

      const previousMeetingTasks = input.meetingId
        ? queryClient.getQueryData<ActionItem[]>(
            taskKeys.meeting(workspaceId, input.meetingId)
          )
        : undefined

      const optimisticTask: ActionItem = {
        id: crypto.randomUUID(),
        title: input.title,
        isCompleted: input.isCompleted,
        assignee: input.assignee,
      }

      previousLists.forEach(([queryKey, groups]) => {
        if (!groups) return

        queryClient.setQueryData<TasksGroup[]>(
          queryKey,
          insertTaskIntoGroups(groups, optimisticTask, input.meetingId)
        )
      })

      if (input.meetingId) {
        queryClient.setQueryData<ActionItem[]>(
          taskKeys.meeting(workspaceId, input.meetingId),
          (tasks) =>
            insertTaskIntoMeetingTasks(tasks ?? [], optimisticTask)
        )
      }

      return {
        previousLists,
        previousMeetingTasks,
        meetingId: input.meetingId,
        optimisticTaskId: optimisticTask.id,
      }
    },

    onError: (_error, _input, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })

      if (context?.meetingId) {
        queryClient.setQueryData(
          taskKeys.meeting(workspaceId, context.meetingId),
          context.previousMeetingTasks
        )
      }

      toast.error("Failed to add task. Please try again.")
    },

    onSuccess: (createdTask, _input, context) => {
      const allLists = queryClient.getQueriesData<TasksGroup[]>({
        queryKey: taskKeys.lists(workspaceId),
      })

      allLists.forEach(([queryKey, groups]) => {
        if (!groups) return

        queryClient.setQueryData<TasksGroup[]>(
          queryKey,
          replaceOptimisticTaskInGroups(
            groups,
            context?.optimisticTaskId ?? "",
            createdTask
          )
        )
      })

      if (context?.meetingId) {
        queryClient.setQueryData<ActionItem[]>(
          taskKeys.meeting(workspaceId, context.meetingId),
          (tasks) =>
            replaceOptimisticTaskInMeetingTasks(
              tasks ?? [],
              context.optimisticTaskId,
              createdTask
            )
        )
      }
    },

    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(workspaceId),
      })

      if (input.meetingId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.meeting(workspaceId, input.meetingId),
        })
      }
    },
  })

  return {
    addTask: mutation.mutate,
    addTaskAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
