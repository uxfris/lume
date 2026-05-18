import type { ActionItem, TasksGroup } from "@workspace/types"

export function insertTaskIntoGroups(
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

export function insertTaskIntoMeetingTasks(
  tasks: ActionItem[],
  task: ActionItem
): ActionItem[] {
  return [...tasks, task]
}

export function updateTaskCompletionInGroups(
  groups: TasksGroup[],
  taskId: string,
  isCompleted: boolean
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,
    tasks: group.tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted } : task
    ),
  }))
}

export function updateTaskCompletionInMeetingTasks(
  tasks: ActionItem[],
  taskId: string,
  isCompleted: boolean
): ActionItem[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, isCompleted } : task
  )
}

export function removeTaskFromGroups(
  groups: TasksGroup[],
  taskId: string
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,
    tasks: group.tasks.filter((task) => task.id !== taskId),
  }))
}

export function removeTaskFromMeetingTasks(
  tasks: ActionItem[],
  taskId: string
): ActionItem[] {
  return tasks.filter((task) => task.id !== taskId)
}

export function updateTaskTitleInGroups(
  groups: TasksGroup[],
  taskId: string,
  title: string
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,
    tasks: group.tasks.map((task) =>
      task.id === taskId ? { ...task, title } : task
    ),
  }))
}

export function updateTaskTitleInMeetingTasks(
  tasks: ActionItem[],
  taskId: string,
  title: string
): ActionItem[] {
  return tasks.map((task) => (task.id === taskId ? { ...task, title } : task))
}

export function updateTaskAssigneeInGroups(
  groups: TasksGroup[],
  taskId: string,
  assignee: ActionItem["assignee"]
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,
    tasks: group.tasks.map((task) =>
      task.id === taskId ? { ...task, assignee } : task
    ),
  }))
}

export function updateTaskAssigneeInMeetingTasks(
  tasks: ActionItem[],
  taskId: string,
  assignee: ActionItem["assignee"]
): ActionItem[] {
  return tasks.map((task) => (task.id === taskId ? { ...task, assignee } : task))
}

export function replaceOptimisticTaskInGroups(
  groups: TasksGroup[],
  optimisticTaskId: string,
  createdTask: ActionItem
): TasksGroup[] {
  return groups.map((group) => ({
    ...group,
    tasks: group.tasks.map((task) =>
      task.id === optimisticTaskId ? createdTask : task
    ),
  }))
}

export function replaceOptimisticTaskInMeetingTasks(
  tasks: ActionItem[],
  optimisticTaskId: string,
  createdTask: ActionItem
): ActionItem[] {
  return tasks.map((task) =>
    task.id === optimisticTaskId ? createdTask : task
  )
}
