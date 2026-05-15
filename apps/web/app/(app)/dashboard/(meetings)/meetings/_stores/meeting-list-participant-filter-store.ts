import { create } from "zustand"

type MeetingListParticipantFilterState = {
  selectedParticipantIds: string[]
  toggleParticipantId: (id: string) => void
  clearParticipantFilter: () => void
}

export const useMeetingListParticipantFilter =
  create<MeetingListParticipantFilterState>((set) => ({
    selectedParticipantIds: [],
    toggleParticipantId: (id) =>
      set((s) => ({
        selectedParticipantIds: s.selectedParticipantIds.includes(id)
          ? s.selectedParticipantIds.filter((x) => x !== id)
          : [...s.selectedParticipantIds, id],
      })),
    clearParticipantFilter: () => set({ selectedParticipantIds: [] }),
  }))
