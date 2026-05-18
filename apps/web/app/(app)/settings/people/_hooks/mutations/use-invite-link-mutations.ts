"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceApi } from "@workspace/api-client"
import type { ApiInviteRole } from "@workspace/types"
import { toast } from "sonner"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { peopleKeys } from "../../_lib/people.keys"
import { getPeopleErrorMessage } from "../../_lib/people-errors"
import { uiRoleToApiRole } from "../../_lib/role-utils"

export function useInviteLinkMutations() {
  const { workspaceId } = useCurrentWorkspace()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: peopleKeys.inviteLink(workspaceId),
    })
  }

  const createMutation = useMutation({
    mutationFn: async (role: string) => {
      if (!workspaceId) throw new Error("No workspace selected")
      return workspaceApi.createInviteLink(
        workspaceId,
        uiRoleToApiRole(role) as ApiInviteRole
      )
    },
    onSuccess: () => {
      toast.success("Invite link created")
      invalidate()
    },
    onError: (error) => toast.error(getPeopleErrorMessage(error)),
  })

  const regenerateMutation = useMutation({
    mutationFn: async (role: string) => {
      if (!workspaceId) throw new Error("No workspace selected")
      return workspaceApi.regenerateInviteLink(
        workspaceId,
        uiRoleToApiRole(role) as ApiInviteRole
      )
    },
    onSuccess: () => {
      toast.success("Invite link regenerated")
      invalidate()
    },
    onError: (error) => toast.error(getPeopleErrorMessage(error)),
  })

  const revokeMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error("No workspace selected")
      await workspaceApi.revokeInviteLink(workspaceId)
    },
    onSuccess: () => {
      toast.success("Invite link deleted")
      invalidate()
    },
    onError: (error) => toast.error(getPeopleErrorMessage(error)),
  })

  return {
    createInviteLink: createMutation.mutateAsync,
    regenerateInviteLink: regenerateMutation.mutateAsync,
    revokeInviteLink: revokeMutation.mutateAsync,
    isPending:
      createMutation.isPending ||
      regenerateMutation.isPending ||
      revokeMutation.isPending,
  }
}
