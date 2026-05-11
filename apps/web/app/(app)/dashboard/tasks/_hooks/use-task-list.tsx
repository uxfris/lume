import { useState } from "react"
import { toast } from "sonner"
import { useNewTaskForm } from "./use-task-form"
import { ActionItem, TasksGroup, UserSummary } from "@workspace/types"
import { taskApi } from "@workspace/api-client"

export function useTaskList(tasksGroup: TasksGroup) {
  const [tasks, setTasks] = useState<ActionItem[]>(tasksGroup.tasks)
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)

  // ─── Actions ──────────────────────────────────────────────────────────────

  async function toggleTask(id: string) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return

    setTasks((curr) =>
      curr.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    )

    try {
      await taskApi.toggle(id, !prev.isCompleted)
    } catch {
      setTasks((curr) =>
        curr.map((t) =>
          t.id === id ? { ...t, isCompleted: prev.isCompleted } : t
        )
      )
      toast.error("Failed to update task. Please try again.")
    }
  }

  async function addTask(
    title: string,
    assignee: UserSummary | null,
    isCompleted: boolean
  ) {
    const optimisticId = crypto.randomUUID()
    const optimisticTask: ActionItem = {
      id: optimisticId,
      title,
      isCompleted,
      assignee,
    }

    setTasks((curr) => [...curr, optimisticTask])

    try {
      const created = await taskApi.add({
        title,
        assignee,
        isCompleted,
        meetingId: tasksGroup.id === "workspace" ? null : tasksGroup.id,
      })
      setTasks((curr) => curr.map((t) => (t.id === optimisticId ? created : t)))
    } catch {
      setTasks((curr) => curr.filter((t) => t.id !== optimisticId))
      toast.error("Failed to add task. Please try again.")
    }
  }

  async function deleteTask(id: string) {
    const index = tasks.findIndex((t) => t.id === id)
    const snapshot = tasks[index]

    if (!snapshot) return

    // remove locally first
    setTasks((curr) => curr.filter((t) => t.id !== id))

    let undone = false

    const timeout = setTimeout(async () => {
      if (undone) return

      try {
        await taskApi.remove(id)
      } catch {
        // rollback if API failed
        setTasks((curr) => {
          if (curr.find((t) => t.id === id)) return curr

          const restored = [...curr]
          restored.splice(index, 0, snapshot)

          return restored
        })

        toast.error("Failed to delete task.")
      }
    }, 5000) // undo window

    toast("Task deleted", {
      position: "bottom-center",
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          undone = true
          clearTimeout(timeout)

          setTasks((curr) => {
            const restored = [...curr]
            restored.splice(index, 0, snapshot)
            return restored
          })
        },
      },
    })
  }

  async function updateTaskTitle(id: string, title: string) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return

    setTasks((curr) => curr.map((t) => (t.id === id ? { ...t, title } : t)))

    try {
      await taskApi.updateTitle(id, title)
    } catch {
      setTasks((curr) =>
        curr.map((t) => (t.id === id ? { ...t, title: prev.title } : t))
      )
      toast.error("Failed to update task title.")
    }
  }

  async function updateAssignee(id: string, assignee: UserSummary | null) {
    const prev = tasks.find((t) => t.id === id)
    if (!prev) return

    setTasks((curr) => curr.map((t) => (t.id === id ? { ...t, assignee } : t)))

    try {
      await taskApi.updateAssignee(id, assignee)
    } catch {
      setTasks((curr) =>
        curr.map((t) => (t.id === id ? { ...t, assignee: prev.assignee } : t))
      )
      toast.error("Failed to update assignee.")
    }
  }

  // ─── Form (delegates to useNewTaskForm) ───────────────────────────────────

  const form = useNewTaskForm({ onCommit: addTask })

  // ─── Derived ──────────────────────────────────────────────────────────────
  const incompleteTasks = tasks.filter((t) => !t.isCompleted)
  const completedTasks = tasks.filter((t) => t.isCompleted)

  return {
    // task state
    tasks,
    incompleteTasks,
    completedTasks,
    // ui state
    collapsibleOpen,
    setCollapsibleOpen,
    // actions
    toggleTask,
    addTask,
    deleteTask,
    updateTaskTitle,
    updateAssignee,
    // form (spread or pass as a group — consumer's choice)
    form,
  }
}
