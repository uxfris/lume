import type { ApiError } from "@workspace/api-client"

const INVITE_ERROR_MESSAGES: Record<string, string> = {
  INVITE_NOT_FOUND: "This invitation link is invalid or no longer exists.",
  EMAIL_MISMATCH: "Sign in with the email address this invitation was sent to.",
  INVITE_REVOKED: "This invitation has been revoked.",
  INVITE_EXPIRED: "This invitation has expired.",
  INVITE_ALREADY_USED: "This invitation has already been used.",
}

export function getInviteErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "detail" in error) {
    const code = String((error as ApiError).detail)
    const message = INVITE_ERROR_MESSAGES[code]
    if (message) return message
  }

  return "Unable to accept this invitation. Please try again."
}
