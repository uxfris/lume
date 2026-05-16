"use client"

import { AssigneesProvider } from "@/app/(app)/dashboard/tasks/_hooks/use-task-assigness"
import { NewTaskRow } from "@/app/(app)/dashboard/tasks/_components/new-task-row"
import { useMembersQuery } from "@/app/(app)/settings/people/_hooks/queries/use-members-query"
import { Button } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { cn } from "@workspace/ui/lib/utils"
import { AltArrowDown } from "@solar-icons/react"
import { Plus } from "lucide-react"
import { MeetingDocumentActionItemHeader } from "./meeting-document-action-item-header"
import { MeetingDocumentActionItemRow } from "./meeting-document-action-item-row"
import { useMeetingTaskList } from "../_hooks/use-meeting-task-list"

type MeetingDocumentActionItemProps = {
  meetingId: string
}

export function MeetingDocumentActionItem({
  meetingId,
}: MeetingDocumentActionItemProps) {
  const { data: assignees = [] } = useMembersQuery()
  const {
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
  } = useMeetingTaskList(meetingId)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      form.commit()
    }
    if (e.key === "Escape") {
      e.preventDefault()
      form.reset()
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">Loading action items...</p>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-destructive">Failed to load action items.</p>
      </section>
    )
  }

  const showTasks = tasks.length > 0 || form.isAdding

  return (
    <AssigneesProvider assignees={assignees}>
      <section className="group/task space-y-4">
        <MeetingDocumentActionItemHeader
          tasks={tasks}
          onUpdateAssignee={(id, assignee) => updateAssignee(id, assignee)}
        />

        {showTasks && (
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <MeetingDocumentActionItemRow
                key={task.id}
                item={task}
                onToggle={() => toggleTask(task.id, !task.isCompleted)}
                onDelete={() => deleteTask(task.id)}
                onUpdateTitle={(title) => updateTaskTitle(task.id, title)}
                onUpdateAssignee={(assignee) =>
                  updateAssignee(task.id, assignee)
                }
              />
            ))}

            {form.isAdding && (
              <NewTaskRow
                rowRef={form.newTaskRowRef}
                title={form.newTaskTitle}
                checked={form.temporaryChecked}
                onCheckedChange={form.setTemporaryChecked}
                assignee={form.temporaryAssignee}
                onAssigneeChange={form.setTemporaryAssignee}
                onTitleChange={form.setNewTaskTitle}
                onKeyDown={handleKeyDown}
              />
            )}

            {completedTasks.length > 0 && (
              <Collapsible
                open={collapsibleOpen}
                onOpenChange={setCollapsibleOpen}
                className="space-y-1"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="bg-transparent aria-expanded:bg-transparent"
                  >
                    <AltArrowDown
                      className={cn(
                        "rotate-0 transition-all duration-200",
                        collapsibleOpen && "rotate-180"
                      )}
                    />
                    <span>{completedTasks.length} Completed</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  {completedTasks.map((task) => (
                    <MeetingDocumentActionItemRow
                      key={task.id}
                      item={task}
                      onToggle={() => toggleTask(task.id, !task.isCompleted)}
                      onDelete={() => deleteTask(task.id)}
                      onUpdateTitle={(title) => updateTaskTitle(task.id, title)}
                      onUpdateAssignee={(assignee) =>
                        updateAssignee(task.id, assignee)
                      }
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          className="p-0 text-base font-normal text-muted-foreground-2 hover:bg-transparent"
          onClick={() => form.setIsAdding(true)}
        >
          <Plus /> New Task
        </Button>
      </section>
    </AssigneesProvider>
  )
}
