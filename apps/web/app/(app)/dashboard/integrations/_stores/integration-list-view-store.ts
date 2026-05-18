import { create } from "zustand"

type IntegrationListViewState = {
  view: "grid" | "list"
  setView: (view: "grid" | "list") => void
}

export const useIntegrationListView = create<IntegrationListViewState>((set) => ({
  view: "grid",
  setView: (view) => set({ view }),
}))
