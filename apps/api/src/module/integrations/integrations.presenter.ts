import type { IntegrationRecentActivity } from "@workspace/types"

export function formatActivityTimestamp(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function presentActivities(
  rows: Array<{
    id: string
    title: string
    description: string | null
    status: "SUCCEEDED" | "FAILED"
    createdAt: Date
  }>
): IntegrationRecentActivity[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    timestamp: formatActivityTimestamp(row.createdAt),
    status: row.status,
  }))
}
