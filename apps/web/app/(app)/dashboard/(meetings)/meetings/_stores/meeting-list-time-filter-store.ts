import { create } from "zustand"
import type { DateRange } from "react-day-picker"

export type MeetingTimePreset =
  | "any-time"
  | "today"
  | "last-7-days"
  | "last-14-days"
  | "last-30-days"

type MeetingListTimeFilterState = {
  preset: MeetingTimePreset
  customRange: DateRange | undefined
  setPreset: (preset: MeetingTimePreset) => void
  setCustomRange: (range: DateRange | undefined) => void
  clearTimeFilter: () => void
}

export const useMeetingListTimeFilter = create<MeetingListTimeFilterState>(
  (set) => ({
    preset: "any-time",
    customRange: undefined,
    setPreset: (preset) => set({ preset, customRange: undefined }),
    setCustomRange: (customRange) => set({ customRange }),
    clearTimeFilter: () =>
      set({ preset: "any-time", customRange: undefined }),
  })
)
