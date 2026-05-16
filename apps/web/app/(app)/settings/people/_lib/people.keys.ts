export const peopleKeys = {
  all: (workspaceId: string | null) => ["people", workspaceId] as const,
  members: (workspaceId: string | null) => [
    ...peopleKeys.all(workspaceId),
    "members",
  ],
}
