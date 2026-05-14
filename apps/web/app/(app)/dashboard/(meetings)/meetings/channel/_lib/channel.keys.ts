export const channelKeys = {
  all: (workspaceId: string | null) => ["channels", workspaceId] as const,
}
