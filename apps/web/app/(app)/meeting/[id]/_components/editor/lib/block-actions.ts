import type { Editor } from "@tiptap/react"
import type { Node } from "@tiptap/pm/model"
import type { SlashCommandItem } from "../slash-command/slash-command-items"

export function duplicateBlock(
  editor: Editor,
  pos: number,
  node: Node
): void {
  editor
    .chain()
    .focus()
    .insertContentAt(pos + node.nodeSize, node.toJSON())
    .run()
}

export function deleteBlock(editor: Editor, pos: number, node: Node): void {
  editor
    .chain()
    .focus()
    .deleteRange({ from: pos, to: pos + node.nodeSize })
    .run()
}

export function turnBlockInto(
  editor: Editor,
  pos: number,
  item: SlashCommandItem
): void {
  const node = editor.state.doc.nodeAt(pos)
  if (!node) return

  const chain = editor.chain().focus().setTextSelection(pos + 1)

  switch (item.title) {
    case "Text":
      chain.setParagraph().run()
      break
    case "Heading 1":
      chain.setHeading({ level: 1 }).run()
      break
    case "Heading 2":
      chain.setHeading({ level: 2 }).run()
      break
    case "Heading 3":
      chain.setHeading({ level: 3 }).run()
      break
    case "Bullet list":
      chain.toggleBulletList().run()
      break
    case "Numbered list":
      chain.toggleOrderedList().run()
      break
    case "To-do list":
      chain.toggleTaskList().run()
      break
    case "Quote":
      chain.setBlockquote().run()
      break
    case "Code":
      chain.setCodeBlock().run()
      break
    case "Divider":
      chain.setHorizontalRule().run()
      break
    default:
      break
  }
}
