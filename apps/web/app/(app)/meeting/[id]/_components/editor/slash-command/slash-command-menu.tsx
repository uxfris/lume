"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@workspace/ui/lib/utils"
import type { SlashMenuState } from "./slash-command-extension"

type SlashCommandMenuProps = {
  menu: SlashMenuState | null
}

export function SlashCommandMenu({ menu }: SlashCommandMenuProps) {
  const [position, setPosition] = useState<{
    top: number
    left: number
  } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!menu?.clientRect) {
      setPosition(null)
      return
    }
    const rect = menu.clientRect()
    if (!rect) {
      setPosition(null)
      return
    }
    setPosition({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    })
  }, [menu])

  useEffect(() => {
    if (!menu || !listRef.current) return
    const selected = listRef.current.querySelector(
      `[data-index="${menu.selectedIndex}"]`
    )
    selected?.scrollIntoView({ block: "nearest" })
  }, [menu?.selectedIndex, menu])

  if (!menu || !position) return null

  const groups = menu.items.reduce<Record<string, typeof menu.items>>(
    (acc, item) => {
      const list = acc[item.group] ?? []
      list.push(item)
      acc[item.group] = list
      return acc
    },
    {}
  )

  let globalIndex = 0

  return createPortal(
    <div
      className="fixed z-[100] w-72 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
        {menu.query
          ? `Results for “${menu.query}”`
          : menu.mode === "filter"
            ? "Type to filter"
            : "Type to search"}
      </div>
      <div
        ref={listRef}
        className="max-h-72 overflow-y-auto p-1"
        role="listbox"
        aria-label="Slash commands"
      >
        {menu.items.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">No results</p>
        ) : null}
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {group}
            </p>
            {items.map((item) => {
              const index = globalIndex++
              const Icon = item.icon
              const isSelected = index === menu.selectedIndex
              return (
                <button
                  key={item.title}
                  type="button"
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    menu.executeItem(index)
                  }}
                  onMouseEnter={() => menu.setSelectedIndex(index)}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{item.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}
