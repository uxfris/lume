"use client"

import { ActionItem, UserSummary } from "@workspace/types"
import { MeetingDocumentActionItemHeader } from "./meeting-document-action-item-header"
import { MeetingDocumentActionItemRow } from "./meeting-document-action-item-row"
import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"


const MOCK_TASKS: ActionItem[] = [
    {
        id: "task-1",
        title: "Create wireframes",
        isCompleted: true,
        assignee: {
            id: "user-1",
            name: "Alice Johnson",
            initials: "AJ",
            avatarUrl: "https://i.pravatar.cc/150?img=1"
        }
    },
    {
        id: "task-2",
        title: "Design landing page",
        isCompleted: false,
        assignee: {
            id: "user-2",
            name: "Bob Smith",
            initials: "BS",
            avatarUrl: "https://i.pravatar.cc/150?img=2"
        }
    },
    {
        id: "task-3",
        title: "Prepare design assets",
        isCompleted: false,
        assignee: null
    }
]


export function MeetingDocumentActionItem() {
    return (
        <section className="space-y-4 group/task">
            <MeetingDocumentActionItemHeader
              tasks={MOCK_TASKS}
              meetingTitle="Meeting"
            />
            <div className="space-y-2">
                {MOCK_TASKS.map((task) => (
                    <MeetingDocumentActionItemRow key={task.id} item={task} onToggle={function (): void {
                        throw new Error("Function not implemented.")
                    }} onDelete={function (): void {
                        throw new Error("Function not implemented.")
                    }} onUpdateTitle={function (title: string): void {
                        throw new Error("Function not implemented.")
                    }} onUpdateAssignee={function (assignee: UserSummary | null): void {
                        throw new Error("Function not implemented.")
                    }} />
                ))}
            </div>
            <Button variant="ghost" className="p-0 text-base font-normal text-muted-foreground-2 hover:bg-transparent" >
                <Plus /> New Task
            </Button>
        </section>
    )
}



