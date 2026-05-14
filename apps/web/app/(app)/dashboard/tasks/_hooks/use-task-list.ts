"use client"

import { useState } from "react"

import type { TasksGroup, UserSummary } from "@workspace/types"

import { useNewTaskForm } from "./use-task-form"
import { useAddTaskMutation } from "./mutations/use-add-task-mutation"
import { useToggleTaskMutation } from "./mutations/use-toggle-task-mutation"
import { useDeleteTaskMutation } from "./mutations/use-delete-task-mutation"
import { useUpdateTaskTitleMutation } from "./mutations/use-update-task-title-mutation"
import { useUpdateTaskAssigneeMutation } from "./mutations/use-update-task-asignee-mutation"

export function useTaskList(tasksGroup: TasksGroup) {
  const [collapsibleOpen, setCollapsibleOpen] = useState(
    () => !tasksGroup.tasks.some((task) => !task.isCompleted)
  )

  // ─── Mutations ─────────────────────

  const addTaskMutation = useAddTaskMutation()

  const toggleTaskMutation = useToggleTaskMutation()

  const deleteTaskMutation = useDeleteTaskMutation()

  const updateTitleMutation = useUpdateTaskTitleMutation()

  const updateAssigneeMutation = useUpdateTaskAssigneeMutation()

  // ─── Actions ───────────────────────

  function toggleTask(id: string, isCompleted: boolean) {
    toggleTaskMutation.toggleTask({
      id,
      isCompleted,
    })
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

      meetingId: tasksGroup.id === "workspace" ? null : tasksGroup.id,
    })
  }

  function deleteTask(taskId: string) {
    const task = tasksGroup.tasks.find((t) => t.id === taskId)

    if (!task) return

    deleteTaskMutation.deleteTask(task)
  }

  function updateTaskTitle(id: string, title: string) {
    updateTitleMutation.updateTask({
      id,
      title,
    })
  }

  function updateAssignee(id: string, assignee: UserSummary | null) {
    updateAssigneeMutation.updateTask({
      id,
      assignee,
    })
  }

  // ─── Form ──────────────────────────

  const form = useNewTaskForm({
    onCommit: addTask,
  })

  // ─── Derived ───────────────────────

  const incompleteTasks = tasksGroup.tasks.filter((task) => !task.isCompleted)

  const completedTasks = tasksGroup.tasks.filter((task) => task.isCompleted)

  return {
    tasks: tasksGroup.tasks,

    incompleteTasks,
    completedTasks,

    collapsibleOpen,
    setCollapsibleOpen,

    toggleTask,
    addTask,
    deleteTask,
    updateTaskTitle,
    updateAssignee,

    form,

    isAddingTask: addTaskMutation.loading,

    isDeletingTask: deleteTaskMutation.loading,
  }
}
