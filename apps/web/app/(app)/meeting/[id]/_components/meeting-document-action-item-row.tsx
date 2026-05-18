"use client"

import { useEffect, useRef, useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { TrashBin2, UserPlus } from "@solar-icons/react"
import { cn } from "@workspace/ui/lib/utils"
import { TaskAssigneeMenu } from "@/app/(app)/dashboard/tasks/_components/task-assignee-menu"
import { ActionItem, UserSummary } from "@workspace/types"

type TaskItemProps = {
  item: ActionItem
  onToggle: () => void
  onDelete: () => void
  onUpdateTitle: (title: string) => void
  onUpdateAssignee: (assignee: UserSummary | null) => void
}

export function MeetingDocumentActionItemRow({
  item,
  onToggle,
  onDelete,
  onUpdateTitle,
  onUpdateAssignee,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitle(item.title)
  }, [item.title])

  function save() {
    const trimmed = title.trim()
    if (!trimmed) {
      onDelete()
      return
    }
    if (trimmed !== item.title) {
      onUpdateTitle(trimmed)
    }
    setIsEditing(false)
  }

  function cancel() {
    setTitle(item.title)
    setIsEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      save()
    }
    if (e.key === "Escape") {
      e.preventDefault()
      cancel()
    }
  }

  return (
    <div className="group/item flex items-start gap-3 py-1">
      <Checkbox
        className="h-5 w-5 border-2"
        checked={item.isCompleted}
        onCheckedChange={onToggle}
      />

      {isEditing ? (
        <Input
          ref={inputRef}
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className="h-fit flex-1 bg-transparent p-0 text-base md:text-base"
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className={cn(
            "line-clamp-2 flex-1 cursor-pointer text-base",
            item.isCompleted && "text-muted-foreground line-through"
          )}
        >
          {item.title}
        </p>
      )}

      <Button
        variant="secondary"
        size="icon-xs"
        onClick={onDelete}
        className="rounded-full opacity-0 group-hover/item:opacity-100"
      >
        <TrashBin2 size={1} className="mt-1 text-destructive" />
      </Button>
      <TaskAssigneeMenu
        tooltip={item.assignee?.name ?? "Add assignee"}
        onUpdateAssignee={onUpdateAssignee}
        assigneeId={item.assignee?.id}
      >
        {item.assignee ? (
          <Avatar>
            <AvatarImage src={item.assignee.avatarUrl} />
            <AvatarFallback>{item.assignee.initials}</AvatarFallback>
          </Avatar>
        ) : (
          <Button variant="secondary" size="icon-xs" className="rounded-full">
            <UserPlus />
          </Button>
        )}
      </TaskAssigneeMenu>
    </div>
  )
}
