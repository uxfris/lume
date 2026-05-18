import type {
  WorkspaceMember,
  WorkspaceMemberInvitation,
} from "@workspace/types"
import { formatDateOnly } from "@/lib/date-format"

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function exportMembersCsv(members: WorkspaceMember[]) {
  downloadCsv("workspace-members.csv", [
    ["Name", "Email", "Role", "Joined"],
    ...members.map((m) => [
      m.name,
      m.email,
      m.role,
      formatDateOnly(m.joinedAt),
    ]),
  ])
}

export function exportInvitationsCsv(
  invitations: WorkspaceMemberInvitation[]
) {
  downloadCsv("workspace-invitations.csv", [
    ["Name", "Email", "Role", "Invited"],
    ...invitations.map((i) => [
      i.name ?? "",
      i.email,
      i.role,
      formatDateOnly(i.invitedAt),
    ]),
  ])
}
