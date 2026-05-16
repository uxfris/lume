import type { JSONContent } from "@tiptap/core"
import type { Meeting } from "@workspace/types"

export function getInitialEditorContent(meeting: Meeting): JSONContent {
  if (meeting.document) {
    return meeting.document as JSONContent
  }

  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  }
}
