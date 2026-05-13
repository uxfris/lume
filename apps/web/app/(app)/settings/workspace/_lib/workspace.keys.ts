export const workspaceKeys = {
  all: ["workspaces"] as const,
  me: () => [...workspaceKeys.all, "me"] as const,
}
