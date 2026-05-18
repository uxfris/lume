import type { Integration } from "@workspace/types"

export function filterIntegrations(
  integrations: Integration[],
  input: {
    searchQuery: string
    category: Integration["category"] | null
    status: Integration["status"] | null
  }
): Integration[] {
  const q = input.searchQuery.trim().toLowerCase()

  return integrations.filter((integration) => {
    if (input.category && integration.category !== input.category) return false
    if (input.status && integration.status !== input.status) return false
    if (!q) return true

    return (
      integration.name.toLowerCase().includes(q) ||
      integration.description.toLowerCase().includes(q) ||
      integration.category.toLowerCase().includes(q)
    )
  })
}
