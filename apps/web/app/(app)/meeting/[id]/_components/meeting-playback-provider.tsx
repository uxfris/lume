"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { Conversation, Sentence } from "@workspace/types"
import { useMeetingAudioQuery } from "../_hooks/queries/use-meeting-audio-query"
import { useMeetingConversationQuery } from "../_hooks/queries/use-meeting-conversation-query"

type MeetingPlaybackContextValue = {
  meetingId: string
  conversation: Conversation | undefined
  isConversationLoading: boolean
  isConversationError: boolean
  hasAudio: boolean
  isAudioLoading: boolean
  currentTimeMs: number
  durationMs: number
  isPlaying: boolean
  playbackRate: number
  togglePlay: () => void
  seekToMs: (ms: number) => void
  skipPrevious: () => void
  skipNext: () => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
  volume: number
}

const MeetingPlaybackContext =
  createContext<MeetingPlaybackContextValue | null>(null)

function collectSentences(conversation: Conversation | undefined): Sentence[] {
  if (!conversation) return []
  return conversation.messages.flatMap((message) => message.sentences)
}

export function MeetingPlaybackProvider({
  meetingId,
  children,
}: {
  meetingId: string
  children: ReactNode
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [durationMs, setDurationMs] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [volume, setVolumeState] = useState(0.8)

  const conversationQuery = useMeetingConversationQuery(meetingId)
  const audioQuery = useMeetingAudioQuery(meetingId)
  const sentences = useMemo(
    () => collectSentences(conversationQuery.data),
    [conversationQuery.data]
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioQuery.data?.url) return
    audio.src = audioQuery.data.url
    audio.load()
  }, [audioQuery.data?.url])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTimeMs(Math.round(audio.currentTime * 1000))
    const onDurationChange = () =>
      setDurationMs(
        Number.isFinite(audio.duration) ? Math.round(audio.duration * 1000) : 0
      )
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("durationchange", onDurationChange)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("durationchange", onDurationChange)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
    }
  }, [audioQuery.data?.url])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  const seekToMs = useCallback((ms: number) => {
    const audio = audioRef.current
    if (!audio) return
    const clamped = Math.max(0, ms / 1000)
    audio.currentTime = clamped
    setCurrentTimeMs(Math.round(clamped * 1000))
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audioQuery.data?.url) return
    if (audio.paused) {
      void audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [audioQuery.data?.url])

  const findSentenceIndex = useCallback(
    (timeMs: number) => {
      if (sentences.length === 0) return -1
      const idx = sentences.findIndex(
        (sentence) =>
          timeMs >= sentence.startTimeMs && timeMs <= sentence.endTimeMs
      )
      if (idx >= 0) return idx
      for (let i = sentences.length - 1; i >= 0; i -= 1) {
        if (sentences[i]!.startTimeMs <= timeMs) return i
      }
      return 0
    },
    [sentences]
  )

  const skipPrevious = useCallback(() => {
    const idx = findSentenceIndex(currentTimeMs)
    if (idx <= 0) {
      seekToMs(0)
      return
    }
    seekToMs(sentences[idx - 1]!.startTimeMs)
  }, [currentTimeMs, findSentenceIndex, seekToMs, sentences])

  const skipNext = useCallback(() => {
    const idx = findSentenceIndex(currentTimeMs)
    if (idx < 0 || idx >= sentences.length - 1) {
      seekToMs(durationMs)
      return
    }
    seekToMs(sentences[idx + 1]!.startTimeMs)
  }, [currentTimeMs, durationMs, findSentenceIndex, seekToMs, sentences])

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate)
  }, [])

  const setVolume = useCallback((next: number) => {
    setVolumeState(Math.min(1, Math.max(0, next)))
  }, [])

  const value = useMemo<MeetingPlaybackContextValue>(
    () => ({
      meetingId,
      conversation: conversationQuery.data,
      isConversationLoading: conversationQuery.isLoading,
      isConversationError: conversationQuery.isError,
      hasAudio: audioQuery.isSuccess,
      isAudioLoading: audioQuery.isLoading,
      currentTimeMs,
      durationMs,
      isPlaying,
      playbackRate,
      togglePlay,
      seekToMs,
      skipPrevious,
      skipNext,
      setPlaybackRate,
      setVolume,
      volume,
    }),
    [
      meetingId,
      conversationQuery.data,
      conversationQuery.isLoading,
      conversationQuery.isError,
      audioQuery.isSuccess,
      audioQuery.isLoading,
      currentTimeMs,
      durationMs,
      isPlaying,
      playbackRate,
      togglePlay,
      seekToMs,
      skipPrevious,
      skipNext,
      setPlaybackRate,
      setVolume,
      volume,
    ]
  )

  return (
    <MeetingPlaybackContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" className="hidden" />
      {children}
    </MeetingPlaybackContext.Provider>
  )
}

export function useMeetingPlayback(): MeetingPlaybackContextValue {
  const ctx = useContext(MeetingPlaybackContext)
  if (!ctx) {
    throw new Error("useMeetingPlayback must be used within MeetingPlaybackProvider")
  }
  return ctx
}
