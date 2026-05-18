import type { Integration } from "@workspace/types"
import { create } from "zustand"

type IntegrationListStatusState = {
  status: Integration["status"] | null
  setStatus: (status: Integration["status"] | null) => void
}

export const useIntegrationListStatus = create<IntegrationListStatusState>((set) => ({
  status: null,
  setStatus: (status) => set({ status }),
}))
