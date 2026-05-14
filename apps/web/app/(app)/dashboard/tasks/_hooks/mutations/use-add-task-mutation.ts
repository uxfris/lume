"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { taskApi, type CreateTaskInput } from "@workspace/api-client"

import type { ActionItem, TasksGroup, UserSummary } from "@workspace/types"
import { taskKeys } from "../../_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

function insertTaskIntoGroups(
  groups: TasksGroup[],
  task: ActionItem,
  meetingId?: string | null
): TasksGroup[] {
  return groups.map((group) => {
    const isWorkspaceGroup = meetingId == null && group.id === "workspace"

    const isMatchingMeetingGroup = meetingId != null && group.id === meetingId

    if (!isWorkspaceGroup && !isMatchingMeetingGroup) {
      return group
    }

    return {
      ...group,
      tasks: [...group.tasks, task],
    }
  })
}

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
        queryKey: taskKeys.lists(workspaceId),
      })

      const previousLists = queryClient.getQueriesData<TasksGroup[]>({
        queryKey: taskKeys.lists(workspaceId),
      })

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

      return {
        previousLists,
        optimisticTaskId: optimisticTask.id,
      }
    },

    onError: (_error, _input, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })

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
          groups.map((group) => ({
            ...group,
            tasks: group.tasks.map((task) =>
              task.id === context?.optimisticTaskId ? createdTask : task
            ),
          }))
        )
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(workspaceId),
      })
    },
  })

  return {
    addTask: mutation.mutate,
    addTaskAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
