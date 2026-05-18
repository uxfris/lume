import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { ActionItem, UserSummary } from "@workspace/types"
import { useEffect, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { TaskAssigneeMenu } from "./task-assignee-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { UserPlus } from "lucide-react"



type SendTaskSelectionDialogProps = {
    open: boolean
    tasks: ActionItem[]
    initialSelectedTasksIds?: string[]
    onOpenChange: (open: boolean) => void
    onContinue: (selectedTasks: string[]) => void
    onUpdateAssignee: (itemId: string, assignee: UserSummary | null) => void
}
export function SendTaskSelectionDialog({ open, tasks, initialSelectedTasksIds, onOpenChange, onContinue, onUpdateAssignee }: SendTaskSelectionDialogProps) {
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())

    const allSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.has(t.id))
    const someSelected = tasks.some(t => selectedTaskIds.has(t.id))

    const toggleTask = (id: string) => {
        setSelectedTaskIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleAllTasks = () => {
        setSelectedTaskIds(prev => {
            if (tasks.every(t => prev.has(t.id))) {
                return new Set()
            }
            return new Set(tasks.map(t => t.id))
        })
    }

    // Optional: clear selection when dialog closes
    useEffect(() => {
        if (open) {
            setSelectedTaskIds(new Set(initialSelectedTasksIds) ?? [])
        }
        if (!open) {
            setSelectedTaskIds(new Set())
        }
    }, [open, initialSelectedTasksIds])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:min-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        Select tasks to send
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <div
                    onClick={toggleAllTasks}
                    className="flex items-center gap-2 w-fit cursor-pointer"
                >
                    <Checkbox
                        className="w-5 h-5 border-2"
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={toggleAllTasks}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-xs text-muted-foreground font-medium">
                        {tasks.length} tasks
                    </p>
                </div>
                <div className="w-full space-y-2">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={cn(
                                "w-full flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-secondary/40",
                                selectedTaskIds.has(task.id) && "bg-secondary/40"
                            )}
                        >
                            <Checkbox
                                className="w-5 h-5 border-2"
                                onCheckedChange={() => toggleTask(task.id)}
                                onClick={(e) => e.stopPropagation()}
                                checked={selectedTaskIds.has(task.id)}
                            />
                            <p className="flex-1 line-clamp-2">
                                {task.title}
                            </p>
                            <div onClick={(e) => e.stopPropagation()}>
                                <TaskAssigneeMenu
                                    tooltip={task.assignee?.name ?? "Add assignee"}
                                    onUpdateAssignee={(assignee) => onUpdateAssignee(task.id, assignee)}
                                    assigneeId={task.assignee?.id}
                                >
                                    {task.assignee ? (
                                        <Avatar>
                                            <AvatarImage src={task.assignee.avatarUrl} />
                                            <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <Button variant="secondary" size="icon-xs" className="rounded-full">
                                            <UserPlus />
                                        </Button>
                                    )}
                                </TaskAssigneeMenu>
                            </div>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <div className="flex justify-end gap-3">
                        <DialogClose asChild>
                            <Button variant="ghost" type="button">Close</Button>
                        </DialogClose>
                        <Button onClick={() => onContinue(Array.from(selectedTaskIds))}>Continue</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}