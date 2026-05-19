import { create } from "zustand"

type PendingBotMeetingIdsState = {
  ids: string[]
  add: (meetingId: string) => void
  remove: (meetingId: string) => void
}

/** Meeting IDs to keep on SSE after dispatching a bot (SCHEDULED → LIVE → processing). */
export const usePendingBotMeetingIds = create<PendingBotMeetingIdsState>(
  (set) => ({
    ids: [],
    add: (meetingId) =>
      set((state) =>
        state.ids.includes(meetingId)
          ? state
          : { ids: [...state.ids, meetingId] }
      ),
    remove: (meetingId) =>
      set((state) => ({
        ids: state.ids.filter((id) => id !== meetingId),
      })),
  })
)
