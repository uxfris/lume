import { create } from "zustand"

type MeetingListSearchState = {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useMeetingListSearch = create<MeetingListSearchState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
