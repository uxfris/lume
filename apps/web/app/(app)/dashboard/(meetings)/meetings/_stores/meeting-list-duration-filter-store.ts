import { create } from "zustand"

export type MeetingDurationPreset =
  | "any-duration"
  | "less-15-min"
  | "15-to-30mins"
  | "30-to-60mins"
  | "60-to-90mins"
  | "more-than-90mins"

type MeetingListDurationFilterState = {
  preset: MeetingDurationPreset
  setDurationPreset: (preset: MeetingDurationPreset) => void
  clearDurationFilter: () => void
}

export const useMeetingListDurationFilter =
  create<MeetingListDurationFilterState>((set) => ({
    preset: "any-duration",
    setDurationPreset: (preset) => set({ preset }),
    clearDurationFilter: () => set({ preset: "any-duration" }),
  }))
