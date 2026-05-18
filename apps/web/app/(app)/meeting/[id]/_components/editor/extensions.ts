import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import Typography from "@tiptap/extension-typography"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import type { Extensions } from "@tiptap/core"
import {
  SlashCommand,
  type SlashCommandOptions,
} from "./slash-command/slash-command-extension"

type GetMeetingEditorExtensionsOptions = Pick<
  SlashCommandOptions,
  "onMenuChange"
>

export function getMeetingEditorExtensions(
  options: GetMeetingEditorExtensionsOptions
): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      codeBlock: {
        HTMLAttributes: {
          class: "meeting-editor-code-block",
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: "meeting-editor-blockquote",
        },
      },
      horizontalRule: {
        HTMLAttributes: {
          class: "meeting-editor-hr",
        },
      },
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "heading") {
          return "Heading"
        }
        return "Press '/' for commands"
      },
      includeChildren: true,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: {
        class: "meeting-editor-link",
      },
    }),
    TaskList.configure({
      HTMLAttributes: { class: "meeting-editor-task-list" },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: { class: "meeting-editor-task-item" },
    }),
    Highlight.configure({
      HTMLAttributes: { class: "meeting-editor-highlight" },
    }),
    Typography,
    SlashCommand.configure({
      onMenuChange: options.onMenuChange,
    }),
  ]
}
