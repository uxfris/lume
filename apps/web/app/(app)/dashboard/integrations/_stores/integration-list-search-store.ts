import { create } from "zustand"

type IntegrationListSearchState = {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useIntegrationListSearch = create<IntegrationListSearchState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
