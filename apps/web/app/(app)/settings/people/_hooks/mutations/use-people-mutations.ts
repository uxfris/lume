"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceApi } from "@workspace/api-client"
import { toast } from "sonner"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"
import { workspaceKeys } from "../../../workspace/_lib/workspace.keys"
import { getPeopleErrorMessage } from "../../_lib/people-errors"
import { peopleKeys } from "../../_lib/people.keys"
import { uiRoleToApiRole } from "../../_lib/role-utils"

function useInvalidatePeople() {
  const queryClient = useQueryClient()
  const { workspaceId } = useCurrentWorkspace()

  return () => {
    void queryClient.invalidateQueries({
      queryKey: peopleKeys.all(workspaceId),
    })
    void queryClient.invalidateQueries({ queryKey: peopleKeys.members(workspaceId) })
    void queryClient.invalidateQueries({
      queryKey: peopleKeys.invitations(workspaceId),
    })
    void queryClient.invalidateQueries({ queryKey: workspaceKeys.me() })
  }
}

export function useInviteMembersMutation() {
  const { workspaceId } = useCurrentWorkspace()
  const invalidate = useInvalidatePeople()

  return useMutation({
    mutationFn: async ({
      emails,
      role,
    }: {
      emails: string[]
      role: string
    }) => {
      if (!workspaceId) throw new Error("No workspace selected")
      const apiRole = uiRoleToApiRole(role)
      const results = await Promise.allSettled(
        emails.map((email) => workspaceApi.invite(email, apiRole, workspaceId))
      )
      const failed = results.filter((r) => r.status === "rejected")
      if (failed.length === results.length) {
        throw (failed[0] as PromiseRejectedResult).reason
      }

      const succeeded = results.filter(
        (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof workspaceApi.invite>>> =>
          r.status === "fulfilled"
      )
      const emailNotSent = succeeded.filter((r) => !r.value.emailSent).length

      return {
        invited: succeeded.length,
        failed: failed.length,
        emailNotSent,
      }
    },
    onSuccess: ({ invited, failed, emailNotSent }) => {
      if (invited > 0) {
        toast.success(
          invited === 1
            ? "Invitation sent"
            : `${invited} invitations sent`
        )
      }
      if (emailNotSent > 0) {
        toast.warning(
          emailNotSent === 1
            ? "Invite created but email could not be sent"
            : `${emailNotSent} invites created but emails could not be sent`,
          {
            description:
              "Check Resend configuration or copy the invite link from the Invited tab.",
          }
        )
      }
      if (failed > 0) {
        toast.message(
          `${failed} invite${failed === 1 ? "" : "s"} could not be sent`
        )
      }
      invalidate()
    },
    onError: (error) => {
      toast.error(getPeopleErrorMessage(error))
    },
  })
}

export function useUpdateMemberRoleMutation() {
  const { workspaceId } = useCurrentWorkspace()
  const invalidate = useInvalidatePeople()

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string
      role: string
    }) => {
      if (!workspaceId) throw new Error("No workspace selected")
      await workspaceApi.updateMemberRole(
        workspaceId,
        memberId,
        uiRoleToApiRole(role)
      )
    },
    onSuccess: () => {
      toast.success("Role updated")
      invalidate()
    },
    onError: (error) => {
      toast.error(getPeopleErrorMessage(error))
    },
  })
}

export function useRemoveMembersMutation() {
  const { workspaceId } = useCurrentWorkspace()
  const invalidate = useInvalidatePeople()

  return useMutation({
    mutationFn: async (memberIds: string[]) => {
      if (!workspaceId) throw new Error("No workspace selected")
      const results = await Promise.allSettled(
        memberIds.map((memberId) =>
          workspaceApi.removeMember(workspaceId, memberId)
        )
      )
      const failed = results.filter((r) => r.status === "rejected")
      if (failed.length === results.length) {
        throw (failed[0] as PromiseRejectedResult).reason
      }
      return { removed: results.length - failed.length, failed: failed.length }
    },
    onSuccess: ({ removed }) => {
      toast.success(
        removed === 1
          ? "Member removed"
          : `${removed} members removed`
      )
      invalidate()
    },
    onError: (error) => {
      toast.error(getPeopleErrorMessage(error))
    },
  })
}

export function useRevokeInvitationMutation() {
  const { workspaceId } = useCurrentWorkspace()
  const invalidate = useInvalidatePeople()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      if (!workspaceId) throw new Error("No workspace selected")
      await workspaceApi.revokeInvitation(workspaceId, invitationId)
    },
    onSuccess: () => {
      toast.success("Invitation revoked")
      invalidate()
    },
    onError: (error) => {
      toast.error(getPeopleErrorMessage(error))
    },
  })
}

export function useLeaveWorkspaceMutation() {
  const { workspaceId, setWorkspaceId } = useCurrentWorkspace()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error("No workspace selected")
      await workspaceApi.leaveWorkspace(workspaceId)
    },
    onSuccess: async () => {
      toast.success("Left workspace", {
        description: "You can rejoin anytime with an invitation.",
      })
      setWorkspaceId(null)
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.me() })
      router.push(routes.dashboard.root)
      router.refresh()
    },
    onError: (error) => {
      toast.error(getPeopleErrorMessage(error))
    },
  })
}
