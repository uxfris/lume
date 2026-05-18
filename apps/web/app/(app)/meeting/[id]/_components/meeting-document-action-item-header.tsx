"use client"

import { SendTaskDialog } from "@/app/(app)/dashboard/tasks/_components/send-task-dialog"
import { SendTaskSelectionDialog } from "@/app/(app)/dashboard/tasks/_components/send-task-selection-dialog"
import { Badge } from "@workspace/ui/components/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { TaskSync } from "@/app/(app)/dashboard/tasks/_components/task-sync"
import { ActionItem, UserSummary } from "@workspace/types"
import { CopyButton } from "@/components/copy-button"
import { useTaskSyncFlow } from "@/app/(app)/dashboard/tasks/_hooks/use-task-sync-flow"

export function MeetingDocumentActionItemHeader({
  tasks,
  meetingTitle,
  onUpdateAssignee,
}: {
  tasks: ActionItem[]
  meetingTitle: string
  onUpdateAssignee?: (id: string, assignee: UserSummary | null) => void
}) {
  const {
    taskSelectionOpen,
    setTaskSelectionOpen,
    taskSendOpen,
    setTaskSendOpen,
    openTaskSelection,
    selectionTasks,
    initialSelectedTasksIds,
    tasksToSend,
    onContinue,
    onSendSuccess,
  } = useTaskSyncFlow({ tasks, meetingTitle })

  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold leading-[1.3]">Action items</h2>
        <Badge variant="secondary" className="text-muted-foreground">
          {tasks.length} items
        </Badge>
        {tasks.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CopyButton
                group="task"
                content={tasks.map((task) => task.title).join("\n")}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy {tasks.length} items</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <TaskSync openTaskSelection={openTaskSelection} />
      <SendTaskSelectionDialog
        open={taskSelectionOpen}
        onOpenChange={setTaskSelectionOpen}
        initialSelectedTasksIds={initialSelectedTasksIds}
        onContinue={onContinue}
        tasks={selectionTasks}
        onUpdateAssignee={onUpdateAssignee ?? (() => {})}
      />
      <SendTaskDialog
        open={taskSendOpen}
        onOpenChange={setTaskSendOpen}
        onSuccess={onSendSuccess}
        tasks={tasksToSend}
        meetingTitle={meetingTitle}
      />
    </div>
  )
}
