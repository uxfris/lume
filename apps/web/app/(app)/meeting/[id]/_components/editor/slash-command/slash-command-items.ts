import type { Editor, Range } from "@tiptap/core"
import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Text,
  type LucideIcon,
} from "lucide-react"

export type SlashCommandItem = {
  title: string
  description: string
  searchTerms: string[]
  icon: LucideIcon
  group: string
  command: (props: { editor: Editor; range: Range }) => void
}

export const slashCommandItems: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Plain paragraph",
    searchTerms: ["text", "paragraph", "p"],
    icon: Text,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    searchTerms: ["h1", "heading", "title"],
    icon: Heading1,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    searchTerms: ["h2", "heading", "subtitle"],
    icon: Heading2,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    searchTerms: ["h3", "heading"],
    icon: Heading3,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    },
  },
  {
    title: "Bullet list",
    description: "Create a simple bulleted list",
    searchTerms: ["bullet", "unordered", "ul", "list"],
    icon: List,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: "Numbered list",
    description: "Create a list with numbering",
    searchTerms: ["numbered", "ordered", "ol", "list"],
    icon: ListOrdered,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: "To-do list",
    description: "Track tasks with checkboxes",
    searchTerms: ["todo", "task", "checkbox", "check"],
    icon: ListTodo,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: "Quote",
    description: "Capture a quote",
    searchTerms: ["quote", "blockquote"],
    icon: Quote,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run()
    },
  },
  {
    title: "Code",
    description: "Capture a code snippet",
    searchTerms: ["code", "codeblock", "snippet"],
    icon: Code2,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run()
    },
  },
  {
    title: "Divider",
    description: "Visually divide blocks",
    searchTerms: ["divider", "hr", "horizontal", "rule", "line"],
    icon: Minus,
    group: "Basic blocks",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
]

export function filterSlashCommandItems(query: string): SlashCommandItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return slashCommandItems
  return slashCommandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.searchTerms.some((term) => term.includes(q))
  )
}
