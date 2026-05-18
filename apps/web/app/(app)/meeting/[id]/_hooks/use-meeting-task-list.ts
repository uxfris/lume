"use client"

import { useState } from "react"
import type { UserSummary } from "@workspace/types"
import { useNewTaskForm } from "@/app/(app)/dashboard/tasks/_hooks/use-task-form"
import { useAddTaskMutation } from "@/app/(app)/dashboard/tasks/_hooks/mutations/use-add-task-mutation"
import { useToggleTaskMutation } from "@/app/(app)/dashboard/tasks/_hooks/mutations/use-toggle-task-mutation"
import { useDeleteTaskMutation } from "@/app/(app)/dashboard/tasks/_hooks/mutations/use-delete-task-mutation"
import { useUpdateTaskTitleMutation } from "@/app/(app)/dashboard/tasks/_hooks/mutations/use-update-task-title-mutation"
import { useUpdateTaskAssigneeMutation } from "@/app/(app)/dashboard/tasks/_hooks/mutations/use-update-task-asignee-mutation"
import { useMeetingTasksQuery } from "./queries/use-meeting-tasks-query"

export function useMeetingTaskList(meetingId: string) {
  const { data: tasks = [], isLoading, isError } = useMeetingTasksQuery(meetingId)

  const [collapsibleOpen, setCollapsibleOpen] = useState(
    () => tasks.length > 0 && !tasks.some((task) => !task.isCompleted)
  )

  const addTaskMutation = useAddTaskMutation()
  const toggleTaskMutation = useToggleTaskMutation()
  const deleteTaskMutation = useDeleteTaskMutation()
  const updateTitleMutation = useUpdateTaskTitleMutation()
  const updateAssigneeMutation = useUpdateTaskAssigneeMutation()

  function toggleTask(id: string, isCompleted: boolean) {
    toggleTaskMutation.toggleTask({ id, isCompleted })
  }

  function addTask(
    title: string,
    assignee: UserSummary | null,
    isCompleted: boolean
  ) {
    addTaskMutation.addTask({
      title,
      assignee,
      isCompleted,
      meetingId,
    })
  }

  function deleteTask(taskId: string) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    deleteTaskMutation.deleteTask(task)
  }

  function updateTaskTitle(id: string, title: string) {
    updateTitleMutation.updateTask({ id, title })
  }

  function updateAssignee(id: string, assignee: UserSummary | null) {
    updateAssigneeMutation.updateTask({ id, assignee })
  }

  const form = useNewTaskForm({ onCommit: addTask })

  const incompleteTasks = tasks.filter((task) => !task.isCompleted)
  const completedTasks = tasks.filter((task) => task.isCompleted)

  return {
    tasks,
    isLoading,
    isError,
    incompleteTasks,
    completedTasks,
    collapsibleOpen,
    setCollapsibleOpen,
    toggleTask,
    deleteTask,
    updateTaskTitle,
    updateAssignee,
    form,
  }
}
