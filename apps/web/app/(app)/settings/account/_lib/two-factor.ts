import type { AuthSession } from "@/lib/auth-client"

export function isTwoFactorEnabled(
  user: AuthSession["user"] | null | undefined
): boolean {
  if (!user) return false
  return (
    "twoFactorEnabled" in user &&
    Boolean((user as { twoFactorEnabled?: boolean }).twoFactorEnabled)
  )
}

export function formatE164Phone(dialCode: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "")
  const normalized = digits.startsWith("0") ? digits.slice(1) : digits
  return `${dialCode}${normalized}`
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.length > 0) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function parseTotpSecret(totpUri: string): string | null {
  try {
    const url = new URL(totpUri)
    return url.searchParams.get("secret")
  } catch {
    return null
  }
}
