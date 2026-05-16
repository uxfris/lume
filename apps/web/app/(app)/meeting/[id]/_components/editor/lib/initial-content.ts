import type { JSONContent } from "@tiptap/core"
import type { Meeting } from "@workspace/types"
import { loadPersistedContent } from "./persistence"

export function getInitialEditorContent(meeting: Meeting): JSONContent {
  const persisted = loadPersistedContent(meeting.id)
  if (persisted) return persisted

  if (meeting.document) {
    return meeting.document as JSONContent
  }

  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  }
}
