"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import type { Meeting } from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"
import { EditorBlockControls } from "./editor-block-controls"
import { EditorBubbleMenu } from "./editor-bubble-menu"
import { EditorTitle } from "./editor-title"
import { getMeetingEditorExtensions } from "./extensions"
import { getInitialEditorContent } from "./lib/initial-content"
import { persistContent } from "./lib/persistence"
import type { SlashMenuState } from "./slash-command/slash-command-extension"
import { SlashCommandMenu } from "./slash-command/slash-command-menu"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import "./meeting-editor.css"

type MeetingEditorProps = {
  meeting: Meeting
  className?: string
}

export function MeetingEditor({ meeting, className }: MeetingEditorProps) {
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const initialContent = useMemo(
    () => getInitialEditorContent(meeting),
    [meeting]
  )

  const onMenuChange = useCallback((state: SlashMenuState | null) => {
    setSlashMenu(state)
  }, [])

  const extensions = useMemo(
    () => getMeetingEditorExtensions({ onMenuChange }),
    [onMenuChange]
  )

  const editor = useEditor({
    extensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: ed }) => {
      setSaveStatus("saving")
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        persistContent(meeting.id, ed.getJSON())
        setSaveStatus("saved")
      }, 500)
    },
  })

  return (
    <TooltipProvider delayDuration={400}>
      <article
        className={cn(
          "group/meeting-editor meeting-editor space-y-4 pb-24",
          className
        )}
        data-slash-placeholder={
          slashMenu
            ? slashMenu.mode === "filter"
              ? "filter"
              : "search"
            : undefined
        }
      >
        <header className="space-y-1">
          <EditorTitle meeting={meeting} />
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "Saved locally"}
          </p>
        </header>

        {editor && (
          <div className="relative -ml-11">
            <EditorBlockControls editor={editor} />
            <EditorBubbleMenu editor={editor} />
            <EditorContent editor={editor} />
            <SlashCommandMenu menu={slashMenu} />
          </div>
        )}
      </article>
    </TooltipProvider>
  )
}
