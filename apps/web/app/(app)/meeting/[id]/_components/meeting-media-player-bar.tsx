"use client"

import {
  FullScreen,
  Pause,
  Play,
  SkipNext,
  SkipPrevious,
  VolumeLoud,
} from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import type { MouseEvent } from "react"
import { formatPlaybackTime } from "../_lib/format-playback-time"
import { useMeetingPlayback } from "./meeting-playback-provider"

const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const

function seekFromProgressBarClick(
  event: MouseEvent<HTMLDivElement>,
  durationMs: number,
  seekToMs: (ms: number) => void
) {
  if (durationMs <= 0) return
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = Math.min(
    1,
    Math.max(0, (event.clientX - rect.left) / rect.width)
  )
  seekToMs(Math.round(ratio * durationMs))
}

export function MeetingMediaPlayerBar() {
  const {
    hasAudio,
    isAudioLoading,
    currentTimeMs,
    durationMs,
    isPlaying,
    playbackRate,
    volume,
    togglePlay,
    seekToMs,
    skipPrevious,
    skipNext,
    setPlaybackRate,
    setVolume,
  } = useMeetingPlayback()

  const progress =
    durationMs > 0 ? Math.min(100, (currentTimeMs / durationMs) * 100) : 0
  const remainingMs = Math.max(0, durationMs - currentTimeMs)
  const currentLabel = formatPlaybackTime(currentTimeMs)
  const remainingLabel = `-${formatPlaybackTime(remainingMs)}`
  const totalLabel = formatPlaybackTime(durationMs)

  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(
      playbackRate as (typeof PLAYBACK_RATES)[number]
    )
    const nextIndex =
      currentIndex >= 0 ? (currentIndex + 1) % PLAYBACK_RATES.length : 0
    setPlaybackRate(PLAYBACK_RATES[nextIndex] ?? 1)
  }

  if (!hasAudio && !isAudioLoading) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 space-y-1 border-t bg-card px-8 py-4 md:space-y-0">
      <MobileProgress
        progress={progress}
        currentLabel={currentLabel}
        remainingLabel={remainingLabel}
        durationMs={durationMs}
        seekToMs={seekToMs}
      />

      <div className="flex items-center justify-center gap-6">
        <div className="flex shrink-0 items-center gap-4">
          <Button
            size="xs"
            className="md:hidden"
            type="button"
            disabled={!hasAudio}
            onClick={cyclePlaybackRate}
          >
            {playbackRate === 1 ? "1X" : `${playbackRate}X`}
          </Button>
          <Button
            size="icon-xl"
            className="hidden rounded-full md:flex"
            type="button"
            disabled={!hasAudio}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause weight="Bold" /> : <Play weight="Bold" />}
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              type="button"
              disabled={!hasAudio}
              onClick={skipPrevious}
            >
              <SkipPrevious />
            </Button>
            <Button
              size="icon-xl"
              className="rounded-full md:hidden"
              type="button"
              disabled={!hasAudio}
              onClick={togglePlay}
            >
              {isPlaying ? <Pause weight="Bold" /> : <Play weight="Bold" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              type="button"
              disabled={!hasAudio}
              onClick={skipNext}
            >
              <SkipNext />
            </Button>
          </div>
          <span className="hidden text-xs font-semibold md:flex">
            {currentLabel} / {totalLabel}
          </span>
        </div>

        <Progress
          value={progress}
          className={cn("hidden flex-1 md:flex", !hasAudio && "opacity-50")}
          onClick={(event) => seekFromProgressBarClick(event, durationMs, seekToMs)}
        />

        <div className="flex shrink-0 items-center gap-6">
          <VolumeControl volume={volume} setVolume={setVolume} />
          <Button
            size="xs"
            className="hidden md:flex"
            type="button"
            disabled={!hasAudio}
            onClick={cyclePlaybackRate}
          >
            {playbackRate === 1 ? "1X" : `${playbackRate}X`}
          </Button>
          <Button size="xs" variant="outline" type="button" disabled>
            <FullScreen />
          </Button>
        </div>
      </div>
    </div>
  )
}

function MobileProgress({
  progress,
  currentLabel,
  remainingLabel,
  durationMs,
  seekToMs,
}: {
  progress: number
  currentLabel: string
  remainingLabel: string
  durationMs: number
  seekToMs: (ms: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Progress
        value={progress}
        className="md:hidden"
        onClick={(event) => seekFromProgressBarClick(event, durationMs, seekToMs)}
      />
      <div className="flex w-full items-center justify-between md:hidden">
        <span className="text-xs font-semibold">{currentLabel}</span>
        <span className="text-xs font-semibold">{remainingLabel}</span>
      </div>
    </div>
  )
}

function VolumeControl({
  volume,
  setVolume,
}: {
  volume: number
  setVolume: (volume: number) => void
}) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button variant="ghost" size="icon" className="rounded-full" type="button">
        <VolumeLoud />
      </Button>
      <Progress
        value={volume * 100}
        className="w-20"
        indicatorClassName="bg-muted-foreground"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const ratio = Math.min(
            1,
            Math.max(0, (event.clientX - rect.left) / rect.width)
          )
          setVolume(ratio)
        }}
      />
    </div>
  )
}
