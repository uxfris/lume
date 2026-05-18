"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/core"
import {
  stripActionItemsFromDoc,
  type Meeting,
  type TiptapJSONContent,
} from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"
import { useUpdateMeetingSummaryMutation } from "../../_hooks/mutations/use-update-meeting-summary-mutation"
import { EditorBlockControls } from "./editor-block-controls"
import { EditorBubbleMenu } from "./editor-bubble-menu"
import { getMeetingEditorExtensions } from "./extensions"
import { getInitialEditorContent } from "./lib/initial-content"
import type { SlashMenuState } from "./slash-command/slash-command-extension"
import { SlashCommandMenu } from "./slash-command/slash-command-menu"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import "./meeting-editor.css"

type MeetingEditorProps = {
  meeting: Meeting
  className?: string
}

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error"

export function MeetingEditor({ meeting, className }: MeetingEditorProps) {
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string | null>(null)

  const { mutate: saveSummary, isPending: isSaving } =
    useUpdateMeetingSummaryMutation(meeting.id)

  const initialContent = useMemo(
    () => getInitialEditorContent(meeting),
    [meeting]
  )

  useEffect(() => {
    lastSavedRef.current = JSON.stringify(initialContent)
  }, [initialContent])

  const onMenuChange = useCallback((state: SlashMenuState | null) => {
    setSlashMenu(state)
  }, [])

  const extensions = useMemo(
    () => getMeetingEditorExtensions({ onMenuChange }),
    [onMenuChange]
  )

  const persistToServer = useCallback(
    (doc: JSONContent) => {
      const stripped = stripActionItemsFromDoc(doc as TiptapJSONContent)
      const serialized = JSON.stringify(stripped)
      if (serialized === lastSavedRef.current) return

      setSaveStatus("saving")
      saveSummary(stripped, {
        onSuccess: () => {
          lastSavedRef.current = serialized
          setSaveStatus("saved")
        },
        onError: () => {
          setSaveStatus("error")
        },
      })
    },
    [saveSummary]
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
      setSaveStatus("pending")
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        persistToServer(ed.getJSON())
      }, 800)
    },
  })

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const statusLabel = (() => {
    if (saveStatus === "pending" || saveStatus === "saving" || isSaving) {
      return "Saving…"
    }
    if (saveStatus === "saved") return "Saved"
    if (saveStatus === "error") return "Save failed"
    return null
  })()

  return (
    <TooltipProvider delayDuration={400}>
      <article
        className={cn(
          "group/meeting-editor meeting-editor space-y-4",
          className
        )}
        data-slash-placeholder={
          slashMenu
            ? slashMenu.mode === "filter"
              ? "filter"
              : "search"
            : undefined
        }
        style={
          slashMenu
            ? ({
                "--slash-hint":
                  slashMenu.mode === "filter"
                    ? "Type to filter"
                    : "Type to search",
              } as React.CSSProperties)
            : undefined
        }
      >
        {statusLabel ? (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {statusLabel}
          </p>
        ) : null}

        {editor && (
          <div className="meeting-editor__surface">
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
