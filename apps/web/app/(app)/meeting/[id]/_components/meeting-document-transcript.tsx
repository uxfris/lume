"use client"

import { MinimalisticMagnifier, Pen } from "@solar-icons/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import type { ConversationMessage, Sentence } from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"
import { useMemo, useState } from "react"
import { useMeetingPlayback } from "./meeting-playback-provider"

function isSentenceActive(currentTimeMs: number, sentence: Sentence) {
  return (
    currentTimeMs >= sentence.startTimeMs && currentTimeMs <= sentence.endTimeMs
  )
}

function messageMatchesQuery(message: ConversationMessage, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  if (message.speaker.toLowerCase().includes(needle)) return true
  return message.sentences.some((sentence) =>
    sentence.text.toLowerCase().includes(needle)
  )
}

export function MeetingDocumentTranscript() {
  const [searchQuery, setSearchQuery] = useState("")
  const {
    conversation,
    isConversationLoading,
    isConversationError,
    currentTimeMs,
    seekToMs,
  } = useMeetingPlayback()

  const messages = useMemo(() => {
    const all = conversation?.messages ?? []
    return all.filter((message) => messageMatchesQuery(message, searchQuery))
  }, [conversation?.messages, searchQuery])

  return (
    <section className="space-y-4 pb-32">
      <div className="flex flex-col justify-between gap-2 md:flex-row">
        <h2 className="text-2xl font-semibold leading-[1.3]">Smart Transcript</h2>
        <TranscriptSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {isConversationLoading ? (
        <p className="px-6 text-sm text-muted-foreground">
          Loading transcript…
        </p>
      ) : null}

      {isConversationError ? (
        <p className="px-6 text-sm text-destructive">
          Could not load the transcript. Try refreshing the page.
        </p>
      ) : null}

      {!isConversationLoading &&
      !isConversationError &&
      messages.length === 0 ? (
        <p className="px-6 text-sm text-muted-foreground">
          {searchQuery.trim()
            ? "No transcript matches your search."
            : "Transcript will appear once this meeting has been transcribed."}
        </p>
      ) : null}

      {messages.map((message) => {
        const isMessageActive = message.sentences.some((sentence) =>
          isSentenceActive(currentTimeMs, sentence)
        )
        return (
          <TranscriptMessage
            key={message.id}
            message={message}
            isMessageActive={isMessageActive}
            currentTimeMs={currentTimeMs}
            onSeek={seekToMs}
          />
        )
      })}
    </section>
  )
}

function TranscriptSearch({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <InputGroup className="w-64 flex-1 bg-input">
        <InputGroupInput
          placeholder="Find in transcript..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <InputGroupAddon className="w-5">
          <MinimalisticMagnifier />
        </InputGroupAddon>
      </InputGroup>
      {/* <TooltipProvider delayDuration={700}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-xs" type="button" disabled>
              <Pen className="text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit transcript</TooltipContent>
        </Tooltip>
      </TooltipProvider> */}
    </div>
  )
}

function TranscriptMessage({
  message,
  isMessageActive,
  currentTimeMs,
  onSeek,
}: {
  message: ConversationMessage
  isMessageActive: boolean
  currentTimeMs: number
  onSeek: (ms: number) => void
}) {
  return (
    <div
      className={cn(
        "flex gap-2 rounded-md px-6 py-4 lg:-mx-6",
        isMessageActive && "bg-primary/5"
      )}
    >
      <div className="hidden w-16 flex-none pt-1 md:block">
        <p className="text-xs text-muted-foreground">{message.timestamp}</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase">{message.speaker}</p>
          <p className="text-xs text-muted-foreground md:hidden">
            {message.timestamp}
          </p>
        </div>
        <p className="text-[15px] leading-6">
          {message.sentences.map((sentence) => {
            const isActive = isSentenceActive(currentTimeMs, sentence)
            return (
              <span
                key={sentence.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "cursor-pointer transition-colors",
                  isActive ? "text-accent-4" : "text-muted-foreground"
                )}
                onClick={() => onSeek(sentence.startTimeMs)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onSeek(sentence.startTimeMs)
                  }
                }}
              >
                {sentence.text}{" "}
              </span>
            )
          })}
        </p>
      </div>
    </div>
  )
}
