const MAX_HANDLE_LENGTH = 20
const MIN_HANDLE_LENGTH = 3

export function normalizeWorkspaceHandle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, MAX_HANDLE_LENGTH)
}

export function isValidWorkspaceHandle(handle: string): boolean {
  return (
    handle.length >= MIN_HANDLE_LENGTH &&
    handle.length <= MAX_HANDLE_LENGTH &&
    /^[a-z0-9_-]+$/.test(handle)
  )
}

export function buildHandleSuggestions(name: string): string[] {
  const tokens = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

  const suggestions = new Set<string>()

  if (tokens.length >= 1) {
    suggestions.add(normalizeWorkspaceHandle(tokens.join("_")))
    suggestions.add(normalizeWorkspaceHandle(tokens[0]!))
  }

  if (tokens.length >= 2) {
    suggestions.add(normalizeWorkspaceHandle(`${tokens[0]}_${tokens[1]}`))
    suggestions.add(normalizeWorkspaceHandle(`${tokens[0]}_co`))
  }

  return Array.from(suggestions)
    .filter((handle) => isValidWorkspaceHandle(handle))
    .slice(0, 3)
}
