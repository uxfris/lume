import type { JSONContent } from "@tiptap/core"
import {
  stripActionItemsFromDoc,
  type Meeting,
  type TiptapJSONContent,
} from "@workspace/types"

export function getInitialEditorContent(meeting: Meeting): JSONContent {
  if (meeting.document) {
    return stripActionItemsFromDoc(
      meeting.document as TiptapJSONContent
    ) as JSONContent
  }

  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  }
}
