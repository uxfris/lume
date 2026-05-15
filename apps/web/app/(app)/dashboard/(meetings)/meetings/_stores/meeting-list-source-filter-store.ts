import type { MeetingCaptureSource } from "@workspace/types"
import { create } from "zustand"

type MeetingListSourceFilterState = {
  selectedSources: MeetingCaptureSource[]
  toggleSource: (source: MeetingCaptureSource) => void
  clearSourceFilter: () => void
}

export const useMeetingListSourceFilter =
  create<MeetingListSourceFilterState>((set) => ({
    selectedSources: [],
    toggleSource: (source) =>
      set((s) => ({
        selectedSources: s.selectedSources.includes(source)
          ? s.selectedSources.filter((x) => x !== source)
          : [...s.selectedSources, source],
      })),
    clearSourceFilter: () => set({ selectedSources: [] }),
  }))
