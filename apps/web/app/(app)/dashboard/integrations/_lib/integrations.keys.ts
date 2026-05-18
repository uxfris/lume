export const integrationsKeys = {
  all: ["integrations"] as const,
  list: (workspaceId: string | null) =>
    [...integrationsKeys.all, "list", workspaceId] as const,
  detail: (workspaceId: string | null, provider: string) =>
    [...integrationsKeys.all, "detail", workspaceId, provider] as const,
  activity: (workspaceId: string | null, provider: string) =>
    [...integrationsKeys.all, "activity", workspaceId, provider] as const,
  channels: (workspaceId: string | null, provider: string) =>
    [...integrationsKeys.all, "channels", workspaceId, provider] as const,
}
