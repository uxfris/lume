import { Badge } from "@workspace/ui/components/badge"

import { formatDate } from "@/lib/date-format"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { useState } from "react"
import { ActionItem, UserSummary } from "@workspace/types"
import { TaskSync } from "./task-sync"
import { SendTaskSelectionDialog } from "./send-task-selection-dialog"
import { SendTaskDialog } from "./send-task-dialog"
import { toast } from "sonner"
import { CopyButton } from "@/components/copy-button"

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
  const [taskSelectionOpen, setTaskSelectionOpen] = useState(false)
  const [areInitiallySelected, setAreInitiallySelected] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<String[]>([])
  const [taskSendOpen, setTaskSendOpen] = useState(false)

  const onOpenTaskSelection = (state: boolean) => {
    setAreInitiallySelected(state)
    setTaskSelectionOpen(true)
  }

  const onContinue = (selectedTaskIds: string[]) => {
    setSelectedTaskIds(selectedTaskIds)
    setTaskSelectionOpen(false)
    setTaskSendOpen(true)
  }

  const onSuccess = () => {
    //TODO: change the platform
    setTaskSendOpen(false)
    toast.success("Tasks sent to Trello")
  }

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
          <TaskSync
            openTaskSelectionDialog={(areInitiallySelected) =>
              onOpenTaskSelection(areInitiallySelected)
            }
          />
        </div>
        <time dateTime={timestamp} className="text-xs text-muted-foreground">
          {formatDate(timestamp)}
        </time>
      </div>
      <SendTaskSelectionDialog
        open={taskSelectionOpen}
        onOpenChange={setTaskSelectionOpen}
        initialSelectedTasksIds={
          areInitiallySelected ? tasks.map((t) => t.id) : undefined
        }
        onContinue={onContinue}
        tasks={tasks}
        onUpdateAssignee={onUpdateAssignee}
      />
      <SendTaskDialog
        open={taskSendOpen}
        onOpenChange={setTaskSendOpen}
        onSuccess={onSuccess}
        tasks={tasks.filter((t) => selectedTaskIds.includes(t.id))}
      />
    </div>
  )
}
