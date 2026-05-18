"use client"

import { Badge } from "@workspace/ui/components/badge"

import { formatDate } from "@/lib/date-format"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { ActionItem, UserSummary } from "@workspace/types"
import { TaskSync } from "./task-sync"
import { SendTaskSelectionDialog } from "./send-task-selection-dialog"
import { SendTaskDialog } from "./send-task-dialog"
import { CopyButton } from "@/components/copy-button"
import { useTaskSyncFlow } from "../_hooks/use-task-sync-flow"

type TaskListHeaderProps = {
  title: string
  timestamp: string
  tasks: ActionItem[]
  onUpdateAssignee: (itemId: string, assignee: UserSummary | null) => void
}

export function TaskListHeader({
  title,
  timestamp,
  tasks,
  onUpdateAssignee,
}: TaskListHeaderProps) {
  const {
    taskSelectionOpen,
    setTaskSelectionOpen,
    taskSendOpen,
    setTaskSendOpen,
    openTaskSelection,
    selectionTasks,
    initialSelectedTasksIds,
    tasksToSend,
    meetingTitle,
    onContinue,
    onSendSuccess,
  } = useTaskSyncFlow({ tasks, meetingTitle: title })

  return (
    <div className="flex w-full items-center">
      <div
        className="w-1 self-stretch rounded-full bg-primary"
        aria-hidden={true}
      />
      <div className="w-full pl-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-semibold">{title}</h2>
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
        </div>
        <time dateTime={timestamp} className="text-xs text-muted-foreground">
          {formatDate(timestamp)}
        </time>
      </div>
      <SendTaskSelectionDialog
        open={taskSelectionOpen}
        onOpenChange={setTaskSelectionOpen}
        initialSelectedTasksIds={initialSelectedTasksIds}
        onContinue={onContinue}
        tasks={selectionTasks}
        onUpdateAssignee={onUpdateAssignee}
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
