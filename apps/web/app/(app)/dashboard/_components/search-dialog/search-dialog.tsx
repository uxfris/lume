"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useEffect, useState } from "react"
import { Field } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { MinimalisticMagnifier } from "@solar-icons/react"
import MeetingItem from "../meetings/meeting-item"
import { useDebounce } from "@workspace/ui/hooks/use-debounce"
import type { Meeting } from "@workspace/types"
import { meetingApi, searchApi } from "@workspace/api-client"

type SearchDialogProps = {
  openSearch: boolean
  onOpenSearchChange: (open: boolean) => void
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function highlightText(text: string, query: string): string {
  const keywords = query
    .trim()
    .split(/\s+/)
    .map((k) => k.trim())
    .filter(Boolean)

  if (keywords.length === 0) return text

  const pattern = new RegExp(`(${keywords.map(escapeRegExp).join("|")})`, "gi")
  return text.replace(pattern, "<mark>$1</mark>")
}

function withHighlights(meeting: Meeting, query: string): Meeting {
  return {
    ...meeting,
    title: highlightText(meeting.title, query),
    summary: highlightText(meeting.summary, query),
  }
}

export function SearchDialog({
  openSearch,
  onOpenSearchChange,
}: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Meeting[]>([])
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)

  const debounceQuery = useDebounce(query, 350)

  useEffect(() => {
    let cancelled = false

    async function loadRecent() {
      try {
        const meetings = await meetingApi.getMeetingsList({ limit: 8 })
        if (!cancelled) setRecentMeetings(meetings)
      } catch {
        if (!cancelled) setRecentMeetings([])
      }
    }

    if (openSearch) loadRecent()
    return () => {
      cancelled = true
    }
  }, [openSearch])

  useEffect(() => {
    const trimmed = debounceQuery.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function runSearch() {
      try {
        const rows = await searchApi.searchMeetings(trimmed, { limit: 10 })
        if (!cancelled) {
          setResults(rows.map((row) => withHighlights(row.meeting, trimmed)))
        }
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    runSearch()
    return () => {
      cancelled = true
    }
  }, [debounceQuery])

  console.log(results)

  return (
    <Dialog open={openSearch} onOpenChange={onOpenSearchChange}>
      <DialogContent className="flex h-[80vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Search Meetings</DialogTitle>
          <Field orientation="horizontal" className="gap-0">
            <MinimalisticMagnifier size={18} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search meetings by title or keyword"
              className="bg-transparent text-lg font-medium"
            />
          </Field>
        </DialogHeader>

        {!query && (
          <>
            <h3 className="text-[10px] font-medium text-muted-foreground">
              RECENT MEETINGS
            </h3>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="rounded-md border border-border"
                >
                  <MeetingItem meeting={meeting} />
                </div>
              ))}
            </div>
          </>
        )}

        {loading && <span>Loading...</span>}
        {!loading && results.length === 0 && debounceQuery.trim() && (
          <span>No result found</span>
        )}
        {!loading && query && (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
            {results.map((meeting) => (
              <div key={meeting.id} className="rounded-md border border-border">
                <MeetingItem meeting={meeting} />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
