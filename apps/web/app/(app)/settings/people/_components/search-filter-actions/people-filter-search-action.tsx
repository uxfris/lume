import { PeopleSearch } from "./people-search"
import { PeopleSelect } from "./people-select"
import { PeopleRolePopover } from "./people-role-popover"
import { PeopleExport } from "./people-export"
import { PeopleLinkInvite } from "./people-link-invite"
import { PeopleInviteMembers } from "./people-invite-members"
import type {
  WorkspaceMember,
  WorkspaceMemberInvitation,
  ApiWorkspaceRole,
} from "@workspace/types"

export function PeopleSearchFilterAction({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  selectionMode,
  onSelectionModeChange,
  onInviteMembers,
  isInvitePending,
  canManageMembers = true,
  actorRole,
  members = [],
  invitations = [],
  activeTab = "all",
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  filterValue: string
  onFilterChange: (value: string) => void
  selectionMode: boolean
  onSelectionModeChange: (mode: boolean) => void
  onInviteMembers?: (emails: string[], role: string) => void
  isInvitePending?: boolean
  canManageMembers?: boolean
  actorRole?: ApiWorkspaceRole
  members?: WorkspaceMember[]
  invitations?: WorkspaceMemberInvitation[]
  activeTab?: "all" | "invited"
}) {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-2">
      <div className="flex flex-col lg:flex-row items-center gap-2">
        <PeopleSearch value={searchValue} onChange={onSearchChange} />
        <PeopleRolePopover filterValue={filterValue} onFilterChange={onFilterChange} />
      </div>
      {canManageMembers && (
        <div className="flex items-center gap-2">
          <PeopleSelect
            selectionMode={selectionMode}
            onSelectionModeChange={onSelectionModeChange}
          />
          <PeopleExport
            members={members}
            invitations={invitations}
            activeTab={activeTab}
          />
          <PeopleLinkInvite />
          <PeopleInviteMembers
            onInvite={onInviteMembers}
            isPending={isInvitePending}
            actorRole={actorRole}
          />
        </div>
      )}
    </div>
  )
}
