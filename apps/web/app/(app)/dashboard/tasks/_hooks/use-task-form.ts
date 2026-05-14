import { useEffect, useRef, useState } from "react"
import type { UserSummary } from "../../../../../../../packages/types/src/task"

interface UseNewTaskFormOptions {
    onCommit: (title: string, assignee: UserSummary | null, checked: boolean) => void
}

export function useNewTaskForm({ onCommit }: UseNewTaskFormOptions) {
    const [isAdding, setIsAdding] = useState(false)
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [temporaryAssignee, setTemporaryAssignee] = useState<UserSummary | null>(null)
    const [temporaryChecked, setTemporaryChecked] = useState(false)
    const newTaskRowRef = useRef<HTMLDivElement>(null)

    function reset() {
        setNewTaskTitle("")
        setTemporaryChecked(false)
        setTemporaryAssignee(null)
        setIsAdding(false)
    }

    function commit() {
        const trimmed = newTaskTitle.trim()
        if (trimmed) {
            onCommit(trimmed, temporaryAssignee, temporaryChecked)
        }
        reset()
    }

    // Use a ref to avoid stale closure bug — always calls the latest commit
    const commitRef = useRef(commit)
    useEffect(() => { commitRef.current = commit })

    useEffect(() => {
        if (!isAdding) return

        function handleClickOutside(e: MouseEvent) {
            const target = e.target as HTMLElement
            const clickedInsideRow = newTaskRowRef.current?.contains(target)
            const clickedInsideOverlay = target.closest(
                "[data-radix-popper-content-wrapper], [role='menu'], [role='dialog']"
            )
            if (clickedInsideRow || clickedInsideOverlay) return
            commitRef.current()
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isAdding]) // ✅ no stale closure — commitRef.current is always fresh

    return {
        isAdding,
        setIsAdding,
        newTaskTitle,
        setNewTaskTitle,
        temporaryAssignee,
        setTemporaryAssignee,
        temporaryChecked,
        setTemporaryChecked,
        newTaskRowRef,
        commit,
        reset,
    }
}