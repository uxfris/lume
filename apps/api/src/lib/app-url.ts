import { env } from "../config/env"

/** Absolute URL on the Next.js app (used in API response schemas that require z.url()). */
export function toAbsoluteFrontendUrl(path: string): string {
  const base = env.FRONTEND_URL.replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalizedPath}`
}
