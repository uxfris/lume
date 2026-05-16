"use client"


import { SendTaskDialog } from "@/app/(app)/dashboard/tasks/_components/send-task-dialog";
import { SendTaskSelectionDialog } from "@/app/(app)/dashboard/tasks/_components/send-task-selection-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { useState } from "react"
import { toast } from "sonner"

import { TaskSync } from "@/app/(app)/dashboard/tasks/_components/task-sync";
import { ActionItem, UserSummary } from "@workspace/types";
import { CopyButton } from "@/components/copy-button";


export function MeetingDocumentActionItemHeader({
  tasks,
  onUpdateAssignee,
}: {
  tasks: ActionItem[]
  onUpdateAssignee: (id: string, assignee: UserSummary | null) => void
}) {
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
        <div className="flex justify-between">

            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                    Action items
                </h2>
                <Badge variant="secondary" className="text-muted-foreground">{tasks.length} items</Badge>
                {tasks.length > 0 && <Tooltip>
                    <TooltipTrigger asChild>
                        <CopyButton group="task" content={tasks.map(task => task.title).join("\n")} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copy {tasks.length} items</p>
                    </TooltipContent>
                </Tooltip>}
            </div>
            <TaskSync openTaskSelectionDialog={(areInitiallySelected) => onOpenTaskSelection(areInitiallySelected)} />
            <SendTaskSelectionDialog
                open={taskSelectionOpen}
                onOpenChange={setTaskSelectionOpen}
                initialSelectedTasksIds={areInitiallySelected ? tasks.map(t => t.id) : undefined}
                onContinue={onContinue}
                tasks={tasks}
                onUpdateAssignee={onUpdateAssignee}
            />
            <SendTaskDialog open={taskSendOpen} onOpenChange={setTaskSendOpen} onSuccess={onSuccess} tasks={tasks.filter((t) => selectedTaskIds.includes(t.id))} />
        </div>

    )
}