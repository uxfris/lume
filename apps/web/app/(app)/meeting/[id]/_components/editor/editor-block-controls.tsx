"use client"

import { useCallback, useRef, useState } from "react"
import { DragHandle } from "@tiptap/extension-drag-handle-react"
import type { Editor } from "@tiptap/react"
import type { Node } from "@tiptap/pm/model"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { GripVertical, Plus } from "lucide-react"
import {
  insertBlockWithSlashMenu,
  isBlockEmpty,
  openSlashMenuAtBlock,
} from "./lib/open-slash-menu"

type EditorBlockControlsProps = {
  editor: Editor
}

function BlockTooltipContent({ lines }: { lines: string[] }) {
  return (
    <span className="flex flex-col gap-0.5 text-center">
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  )
}

export function EditorBlockControls({ editor }: EditorBlockControlsProps) {
  const [hovered, setHovered] = useState<{
    node: Node
    pos: number
  } | null>(null)

  const onNodeChange = useCallback(
    ({ node, pos }: { node: Node | null; pos: number }) => {
      if (!node) {
        setHovered(null)
        return
      }
      setHovered({ node, pos })
    },
    []
  )

  // const showPlus = hovered !== null && !isBlockEmpty(hovered.node)

  const pointerOrigin = useRef({ x: 0, y: 0 })

  const handleDragPointerDown = (e: React.PointerEvent) => {
    // pointerOrigin.current = { x: e.clientX, y: e.clientY }
  }

  const handleDragPointerUp = (e: React.PointerEvent) => {
    if (!hovered) return
    const dx = e.clientX - pointerOrigin.current.x
    const dy = e.clientY - pointerOrigin.current.y
    if (Math.hypot(dx, dy) > 4) return
    e.preventDefault()
    e.stopPropagation()
    openSlashMenuAtBlock(editor, hovered.pos, "search")
  }

  const handlePlusClick = (e: React.MouseEvent) => {
    if (!hovered) return
    e.preventDefault()
    e.stopPropagation()
    insertBlockWithSlashMenu(
      editor,
      hovered.pos,
      hovered.node,
      e.altKey ? "above" : "below",
      "filter"
    )
  }

  return (
    <DragHandle
      editor={editor}
      onNodeChange={onNodeChange}
      className="meeting-editor-block-controls"
    >
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                "size-6 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-label="Add block"
              onClick={handlePlusClick}
            >
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            <BlockTooltipContent
              lines={["Click to add below", "Option-click to add above"]}
            />
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-6 cursor-grab text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
              aria-label="Drag to move"
              onPointerDown={handleDragPointerDown}
              onPointerUp={handleDragPointerUp}
            >
              <GripVertical className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            <BlockTooltipContent
              lines={["Drag to move", "Click or ⌘/ to open Menu"]}
            />
          </TooltipContent>
        </Tooltip>
      </div>
    </DragHandle>
  )
}
