import { create } from "zustand"

type MeetingListHostFilterState = {
  selectedHostIds: string[]
  toggleHostId: (id: string) => void
  clearHostFilter: () => void
}

export const useMeetingListHostFilter = create<MeetingListHostFilterState>(
  (set) => ({
    selectedHostIds: [],
    toggleHostId: (id) =>
      set((s) => ({
        selectedHostIds: s.selectedHostIds.includes(id)
          ? s.selectedHostIds.filter((x) => x !== id)
          : [...s.selectedHostIds, id],
      })),
    clearHostFilter: () => set({ selectedHostIds: [] }),
  })
)
