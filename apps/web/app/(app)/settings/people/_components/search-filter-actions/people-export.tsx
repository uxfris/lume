"use client"

import { DownloadMinimalistic } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import type {
  WorkspaceMember,
  WorkspaceMemberInvitation,
} from "@workspace/types"
import {
  exportInvitationsCsv,
  exportMembersCsv,
} from "../../_lib/export-people-csv"

export function PeopleExport({
  members = [],
  invitations = [],
  activeTab = "all",
}: {
  members?: WorkspaceMember[]
  invitations?: WorkspaceMemberInvitation[]
  activeTab?: "all" | "invited"
}) {
  const exportCSV = () => {
    if (activeTab === "invited") {
      exportInvitationsCsv(invitations)
    } else {
      exportMembersCsv(members)
    }
  }

  return (
    <Button
      className="flex-1"
      size="xs"
      variant="secondary"
      onClick={exportCSV}
      disabled={
        activeTab === "invited"
          ? invitations.length === 0
          : members.length === 0
      }
    >
      <DownloadMinimalistic />
      Export
    </Button>
  )
}
