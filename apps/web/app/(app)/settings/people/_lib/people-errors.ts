import type { ApiError } from "@workspace/api-client"

const PEOPLE_ERROR_MESSAGES: Record<string, string> = {
  FORBIDDEN: "You do not have permission to perform this action.",
  TARGET_NOT_FOUND: "Member not found.",
  CANNOT_CHANGE_OWN_ROLE: "You cannot change your own role.",
  CANNOT_MODIFY_OWNER: "You cannot modify an owner.",
  LAST_OWNER: "This workspace must have at least one owner.",
  INVALID_ROLE: "That role cannot be assigned.",
  ALREADY_MEMBER: "This person is already a member of the workspace.",
  SELF_INVITE: "You cannot invite yourself.",
  INVITE_ALREADY_ACCEPTED: "This invitation was already accepted.",
  INVITE_NOT_FOUND: "Invitation not found.",
  INVITE_ALREADY_REVOKED: "This invitation was already revoked.",
  LAST_WORKSPACE: "You cannot leave your last workspace.",
  SOLE_OWNER:
    "You cannot leave because you are the only owner. Transfer ownership first.",
}

export function getPeopleErrorMessage(error: unknown): string | undefined {
  if (error && typeof error === "object" && "detail" in error) {
    const apiError = error as ApiError
    const code = apiError.detail?.trim()
    if (code && PEOPLE_ERROR_MESSAGES[code]) {
      return PEOPLE_ERROR_MESSAGES[code]
    }
    if (apiError.detail) return apiError.detail
    if (apiError.title) return apiError.title
  }

  return "Something went wrong. Please try again."
}
