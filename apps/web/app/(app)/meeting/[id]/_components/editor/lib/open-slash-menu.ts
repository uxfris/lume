import type { Editor } from "@tiptap/react"
import type { Node } from "@tiptap/pm/model"
import type { SlashMenuMode } from "../slash-command/slash-command-extension"

export function isBlockEmpty(node: Node): boolean {
  return node.textContent.trim().length === 0
}

/** Inserts "/" at the cursor to open the slash command menu. */
export function openSlashMenuAtCursor(
  editor: Editor,
  mode: SlashMenuMode = "search"
): void {
  editor.storage.slashCommand.pendingMode = mode
  const { from, empty } = editor.state.selection
  if (!empty) return
  const textBefore = editor.state.doc.textBetween(
    Math.max(0, from - 1),
    from,
    "\n"
  )
  if (textBefore === "/") return
  editor.chain().focus().insertContent("/").run()
}

/** Opens slash menu within a block (end of block if it has content). */
export function openSlashMenuAtBlock(
  editor: Editor,
  pos: number,
  mode: SlashMenuMode = "search"
): void {
  editor.storage.slashCommand.pendingMode = mode
  const node = editor.state.doc.nodeAt(pos)
  if (!node) return

  const insertAt = isBlockEmpty(node) ? pos + 1 : pos + node.nodeSize - 1
  editor.chain().focus().setTextSelection(insertAt).insertContent("/").run()
}

export function insertBlockWithSlashMenu(
  editor: Editor,
  referencePos: number,
  referenceNode: Node,
  direction: "above" | "below",
  mode: SlashMenuMode = "filter"
): void {
  if (isBlockEmpty(referenceNode)) return

  editor.storage.slashCommand.pendingMode = mode
  const insertPos =
    direction === "below"
      ? referencePos + referenceNode.nodeSize
      : referencePos

  editor
    .chain()
    .focus()
    .insertContentAt(insertPos, { type: "paragraph" })
    .setTextSelection(insertPos + 1)
    .insertContent("/")
    .run()
}
