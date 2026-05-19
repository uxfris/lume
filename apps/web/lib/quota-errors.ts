import type { ApiError } from "@workspace/api-client"

const DEFAULT_QUOTA_MESSAGE =
  "You've reached your Starter plan limit for this billing period. Upgrade to Studio Pro for unlimited meetings."

export function isQuotaExceededError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const api = error as ApiError
  if (api.status === 402) return true

  const detail = typeof api.detail === "string" ? api.detail.trim() : ""
  return detail === "QUOTA_EXCEEDED"
}

export function getQuotaExceededMessage(error: unknown): string {
  if (!error || typeof error !== "object") return DEFAULT_QUOTA_MESSAGE

  const api = error as ApiError
  const detail = typeof api.detail === "string" ? api.detail.trim() : ""
  if (detail && detail !== "QUOTA_EXCEEDED") return detail

  const title = typeof api.title === "string" ? api.title.trim() : ""
  if (
    title &&
    title !== "API Error" &&
    title !== "Payment Required" &&
    title !== "QUOTA_EXCEEDED"
  ) {
    return title
  }

  return DEFAULT_QUOTA_MESSAGE
}
