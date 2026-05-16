import { Extension } from "@tiptap/core"
import { PluginKey } from "@tiptap/pm/state"
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion"
import {
  filterSlashCommandItems,
  type SlashCommandItem,
} from "./slash-command-items"

export type SlashMenuMode = "search" | "filter"

declare module "@tiptap/core" {
  interface Storage {
    slashCommand: {
      pendingMode: SlashMenuMode | null
    }
  }
}

export type SlashMenuState = {
  items: SlashCommandItem[]
  selectedIndex: number
  query: string
  mode: SlashMenuMode
  clientRect: (() => DOMRect | null) | null
  setSelectedIndex: (index: number) => void
  executeItem: (index: number) => void
}

export type SlashCommandOptions = {
  onMenuChange: (state: SlashMenuState | null) => void
}

export const slashCommandPluginKey = new PluginKey("slashCommand")

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addStorage() {
    return {
      pendingMode: null as SlashMenuMode | null,
    }
  },

  addOptions() {
    return {
      onMenuChange: () => {},
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-/": () => {
        const { from, empty } = this.editor.state.selection
        if (!empty) return false
        const textBefore = this.editor.state.doc.textBetween(
          Math.max(0, from - 1),
          from,
          "\n"
        )
        if (textBefore === "/") return false
        this.editor.storage.slashCommand.pendingMode = "search"
        return this.editor.chain().focus().insertContent("/").run()
      },
    }
  },

  addProseMirrorPlugins() {
    const onMenuChange = this.options.onMenuChange
    const editor = this.editor

    return [
      Suggestion<SlashCommandItem, SlashCommandItem>({
        editor: this.editor,
        pluginKey: slashCommandPluginKey,
        char: "/",
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          const isTextBlock =
            $from.parent.type.name === "paragraph" ||
            $from.parent.type.name === "heading"
          return isTextBlock
        },
        items: ({ query }) => filterSlashCommandItems(query),
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
        render: () => {
          let selectedIndex = 0
          let items: SlashCommandItem[] = []
          let runCommand: SuggestionProps<SlashCommandItem>["command"] | null =
            null
          let currentQuery = ""
          let currentMode: SlashMenuMode = "search"
          let currentClientRect: (() => DOMRect | null) | null = null

          const publish = () => {
            onMenuChange({
              items,
              selectedIndex,
              query: currentQuery,
              mode: currentMode,
              clientRect: currentClientRect,
              setSelectedIndex: (index) => {
                selectedIndex = index
                publish()
              },
              executeItem: (index) => {
                const item = items[index]
                if (item && runCommand) {
                  runCommand(item)
                }
              },
            })
          }

          return {
            onStart: (props) => {
              items = props.items
              runCommand = props.command
              selectedIndex = 0
              currentQuery = props.query
              const pending = editor.storage.slashCommand.pendingMode
              currentMode = pending ?? "search"
              editor.storage.slashCommand.pendingMode = null
              currentClientRect = props.clientRect ?? null
              publish()
            },
            onUpdate: (props) => {
              items = props.items
              runCommand = props.command
              selectedIndex = Math.min(
                selectedIndex,
                Math.max(0, props.items.length - 1)
              )
              currentQuery = props.query
              currentClientRect = props.clientRect ?? null
              publish()
            },
            onKeyDown: ({ event }) => {
              if (event.key === "ArrowUp") {
                selectedIndex =
                  (selectedIndex + items.length - 1) % items.length
                publish()
                return true
              }
              if (event.key === "ArrowDown") {
                selectedIndex = (selectedIndex + 1) % items.length
                publish()
                return true
              }
              if (event.key === "Enter") {
                const item = items[selectedIndex]
                if (item && runCommand) {
                  runCommand(item)
                }
                return true
              }
              return false
            },
            onExit: () => {
              onMenuChange(null)
            },
          }
        },
      }),
    ]
  },
})
