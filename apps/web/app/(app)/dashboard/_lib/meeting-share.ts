import type { MeetingGeneralAccess, MeetingShareRole } from "@workspace/types"
import { routes } from "@/lib/routes"

const EMAIL_SPLIT = /[,;\s]+/

export function parseInviteEmails(raw: string): string[] {
  const seen = new Set<string>()
  const emails: string[] = []

  for (const part of raw.split(EMAIL_SPLIT)) {
    const email = part.trim().toLowerCase()
    if (!email || !email.includes("@")) continue
    if (seen.has(email)) continue
    seen.add(email)
    emails.push(email)
  }

  return emails
}

export function buildMeetingShareUrl(meetingId: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "")
  return `${base}${routes.meeting(meetingId)}`
}

export function generalAccessLabel(access: MeetingGeneralAccess): string {
  switch (access) {
    case "workspace":
      return "Teammates"
    case "link":
      return "Teammates & anyone with link"
    default:
      return "Only people invited"
  }
}

export function generalAccessToSelectValue(
  access: MeetingGeneralAccess
): string {
  switch (access) {
    case "workspace":
      return "teammates"
    case "link":
      return "team-anyone"
    default:
      return "owner"
  }
}

export function selectValueToGeneralAccess(value: string): MeetingGeneralAccess {
  switch (value) {
    case "teammates":
    case "team-participants":
      return "workspace"
    case "team-anyone":
      return "link"
    default:
      return "restricted"
  }
}

export function shareRoleToSelectValue(role: MeetingShareRole): string {
  return role === "edit" ? "edit" : "view"
}

export function selectValueToShareRole(value: string): MeetingShareRole {
  if (value === "edit" || value === "full-access") return "edit"
  return "view"
}

export function shareRoleLabel(role: MeetingShareRole): string {
  return role === "edit" ? "Can edit" : "Can view"
}
