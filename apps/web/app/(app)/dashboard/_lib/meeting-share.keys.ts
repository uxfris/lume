export const meetingShareKeys = {
  state: (meetingId: string, workspaceId: string | null) =>
    ["meeting-share", meetingId, workspaceId] as const,
}
