"use client"

import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Spinner } from "@workspace/ui/components/spinner"
import { SettingHeader } from "../../_components/setting-header"
import { PeopleDataTable } from "./people-data-table"
import { peopleColumns } from "./columns/people-column"
import { peopleInvitationColumns } from "./columns/people-invitation-column"
import { InvitationEmpty } from "./people-invitation-empty"
import { usePeopleQuery } from "../_hooks/queries/use-people-query"
import { useInvitationsQuery } from "../_hooks/queries/use-invitations-query"
import { useWorkspacesQuery } from "../../workspace/_hooks/queries/use-workpsace-query"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import {
  useInviteMembersMutation,
  useLeaveWorkspaceMutation,
  useRemoveMembersMutation,
  useRevokeInvitationMutation,
  useUpdateMemberRoleMutation,
} from "../_hooks/mutations/use-people-mutations"
import { canManageMembers } from "@/lib/workspace-permissions"

export function PeoplePageClient() {
  const { workspaceId } = useCurrentWorkspace()
  const { activeWorkspace } = useWorkspacesQuery({ workspaceId })
  const peopleQuery = usePeopleQuery()
  const invitationsQuery = useInvitationsQuery()
  const [activeTab, setActiveTab] = useState<"all" | "invited">("all")

  const updateRoleMutation = useUpdateMemberRoleMutation()
  const removeMembersMutation = useRemoveMembersMutation()
  const revokeInvitationMutation = useRevokeInvitationMutation()
  const leaveWorkspaceMutation = useLeaveWorkspaceMutation()
  const inviteMembersMutation = useInviteMembersMutation()

  const canManage = canManageMembers(activeWorkspace?.role)
  const workspaceName = activeWorkspace?.name ?? "your workspace"
  const memberCount = peopleQuery.data?.length ?? 0
  const builderLabel = memberCount === 1 ? "builder" : "builders"

  const isLoading = peopleQuery.isLoading || invitationsQuery.isLoading

  if (!canManage && !isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-20 md:gap-8 md:p-12">
        <SettingHeader title="People" description="Workspace members" />
        <p className="text-sm text-muted-foreground">
          You do not have permission to view workspace members.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-20 md:gap-8 md:p-12">
        <div className="flex h-64 items-center justify-center">
          <Spinner className="size-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-20 md:gap-8 md:p-12">
      <SettingHeader
        title="People"
        description={`Inviting people to ${workspaceName} gives access to workspace shared projects and credits. You have ${memberCount} ${builderLabel} in this workspace.`}
      />
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "all" | "invited")}
        className="space-y-4"
      >
        <TabsList className="w-fit gap-2">
          <TabsTrigger value="all" className="px-4">
            All
          </TabsTrigger>
          <TabsTrigger value="invited" className="px-4">
            Invited
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <PeopleDataTable
            columns={peopleColumns}
            data={peopleQuery.data ?? []}
            onUpdateRole={(memberId, role) =>
              updateRoleMutation.mutate({ memberId, role })
            }
            onBulkUpdateRole={async (memberIds, role) => {
              await Promise.all(
                memberIds.map((memberId) =>
                  updateRoleMutation.mutateAsync({ memberId, role })
                )
              )
            }}
            onRemoveMembers={async (memberIds) => {
              await removeMembersMutation.mutateAsync(memberIds)
            }}
            onLeaveWorkspace={() => leaveWorkspaceMutation.mutate()}
            onInviteMembers={(emails, role) =>
              inviteMembersMutation.mutate({ emails, role })
            }
            isMutating={
              updateRoleMutation.isPending ||
              removeMembersMutation.isPending ||
              leaveWorkspaceMutation.isPending ||
              inviteMembersMutation.isPending
            }
            canManageMembers={canManage}
            actorRole={activeWorkspace?.role}
            activeTab="all"
            exportInvitations={invitationsQuery.data ?? []}
          />
        </TabsContent>
        <TabsContent value="invited">
          <div className="space-y-2">
            {(invitationsQuery.data?.length ?? 0) === 0 && <InvitationEmpty />}
            {(invitationsQuery.data?.length ?? 0) > 0 && (
              <PeopleDataTable
                columns={peopleInvitationColumns}
                data={invitationsQuery.data ?? []}
                onRevokeInvitation={(invitationId) =>
                  revokeInvitationMutation.mutate(invitationId)
                }
                onInviteMembers={(emails, role) =>
                  inviteMembersMutation.mutate({ emails, role })
                }
                isMutating={
                  revokeInvitationMutation.isPending ||
                  inviteMembersMutation.isPending
                }
                canManageMembers={canManage}
                actorRole={activeWorkspace?.role}
                activeTab="invited"
                exportInvitations={invitationsQuery.data ?? []}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
