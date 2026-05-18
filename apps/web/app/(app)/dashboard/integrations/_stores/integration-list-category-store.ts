import type { Integration } from "@workspace/types"
import { create } from "zustand"

type IntegrationListCategoryState = {
  category: Integration["category"] | null
  setCategory: (category: Integration["category"] | null) => void
}

export const useIntegrationListCategory = create<IntegrationListCategoryState>((set) => ({
  category: null,
  setCategory: (category) => set({ category }),
}))
