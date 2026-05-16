import type { JSONContent } from "@tiptap/core"
import type { Meeting } from "@workspace/types"
import { loadPersistedContent } from "./persistence"
import { stripHtml } from "./strip-html"

function paragraph(text: string): JSONContent {
  return {
    type: "paragraph",
    content: text ? [{ type: "text", text }] : undefined,
  }
}

function heading(level: 2 | 3, text: string): JSONContent {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  }
}

export function getInitialEditorContent(meeting: Meeting): JSONContent {
  const persisted = loadPersistedContent(meeting.id)
  if (persisted) return persisted

  const blocks: JSONContent[] = []

  const summaryText = stripHtml(meeting.summary)
  if (summaryText) {
    blocks.push(heading(2, "Overview"))
    blocks.push(paragraph(summaryText))
  }

  const keyPoints = meeting.keyPoints ?? []
  if (keyPoints.length > 0) {
    blocks.push(heading(2, "Key takeaways"))
    blocks.push({
      type: "bulletList",
      content: keyPoints.map((point) => ({
        type: "listItem",
        content: [paragraph(stripHtml(point))],
      })),
    })
  }

  if (blocks.length === 0) {
    return {
      type: "doc",
      content: [{ type: "paragraph" }],
    }
  }

  return { type: "doc", content: blocks }
}
