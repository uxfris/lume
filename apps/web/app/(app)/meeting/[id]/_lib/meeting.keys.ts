export const meetingKeys = {
  all: (workspaceId: string | null) => ["meetings", workspaceId] as const,
  conversation: (workspaceId: string | null, meetingId: string) =>
    [...meetingKeys.all(workspaceId), meetingId, "conversation"] as const,
  audio: (workspaceId: string | null, meetingId: string) =>
    [...meetingKeys.all(workspaceId), meetingId, "audio"] as const,
}
