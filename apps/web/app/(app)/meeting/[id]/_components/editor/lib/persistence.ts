import type { JSONContent } from "@tiptap/core"

const storageKey = (meetingId: string) => `lume:meeting-notes:${meetingId}`

export function loadPersistedContent(meetingId: string): JSONContent | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(storageKey(meetingId))
    if (!raw) return null
    return JSON.parse(raw) as JSONContent
  } catch {
    return null
  }
}

export function persistContent(meetingId: string, content: JSONContent): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(storageKey(meetingId), JSON.stringify(content))
  } catch {
    // Quota exceeded or private mode — fail silently
  }
}
