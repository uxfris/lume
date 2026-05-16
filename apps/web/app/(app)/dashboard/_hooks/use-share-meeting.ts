"use client"

import { meetingApi } from "@workspace/api-client"
import type { Meeting, MeetingGeneralAccess, MeetingShareRole } from "@workspace/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { meetingShareKeys } from "../_lib/meeting-share.keys"
import { parseInviteEmails } from "../_lib/meeting-share"

export function useShareMeeting({
  meeting,
  open,
}: {
  meeting: Meeting
  open: boolean
}) {
  const { workspaceId } = useCurrentWorkspace()
  const queryClient = useQueryClient()
  const [inviteInput, setInviteInput] = useState("")

  const shareQuery = useQuery({
    queryKey: meetingShareKeys.state(meeting.id, workspaceId),
    queryFn: () => meetingApi.getMeetingShare(meeting.id),
    enabled: open && Boolean(workspaceId),
    staleTime: 30_000,
  })

  const invalidateShare = () => {
    void queryClient.invalidateQueries({
      queryKey: meetingShareKeys.state(meeting.id, workspaceId),
    })
  }

  const inviteMutation = useMutation({
    mutationFn: async (emails: string[]) =>
      meetingApi.inviteToMeeting(meeting.id, { emails, role: "view" }),
    onSuccess: (result) => {
      const invitedCount = result.invited.length
      if (invitedCount > 0) {
        toast.success(
          invitedCount === 1
            ? "Invitation sent"
            : `${invitedCount} invitations sent`
        )
      }
      if (result.skipped.length > 0) {
        toast.message(
          `${result.skipped.length} invite${result.skipped.length === 1 ? "" : "s"} skipped`
        )
      }
      setInviteInput("")
      invalidateShare()
    },
    onError: () => {
      toast.error("Failed to send invitations")
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      shareId,
      role,
    }: {
      shareId: string
      role: MeetingShareRole
    }) => meetingApi.updateMeetingShareRole(meeting.id, shareId, role),
    onSuccess: invalidateShare,
    onError: () => toast.error("Failed to update access"),
  })

  const revokeMutation = useMutation({
    mutationFn: (shareId: string) =>
      meetingApi.revokeMeetingShare(meeting.id, shareId),
    onSuccess: () => {
      toast.success("Access removed")
      invalidateShare()
    },
    onError: () => toast.error("Failed to remove access"),
  })

  const accessMutation = useMutation({
    mutationFn: (generalAccess: MeetingGeneralAccess) =>
      meetingApi.updateMeetingGeneralAccess(meeting.id, generalAccess),
    onSuccess: invalidateShare,
    onError: () => toast.error("Failed to update link access"),
  })

  const submitInvites = () => {
    const emails = parseInviteEmails(inviteInput)
    if (emails.length === 0) {
      toast.error("Enter at least one valid email")
      return
    }
    inviteMutation.mutate(emails)
  }

  const copyShareLink = async () => {
    const url = shareQuery.data?.shareUrl
    if (!url) return
    await navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  return {
    share: shareQuery.data,
    isLoading: shareQuery.isLoading,
    isError: shareQuery.isError,
    inviteInput,
    setInviteInput,
    submitInvites,
    isInviting: inviteMutation.isPending,
    updateCollaboratorRole: (shareId: string, role: MeetingShareRole) =>
      updateRoleMutation.mutate({ shareId, role }),
    removeCollaborator: (shareId: string) => revokeMutation.mutate(shareId),
    updateGeneralAccess: (access: MeetingGeneralAccess) =>
      accessMutation.mutate(access),
    isUpdatingAccess: accessMutation.isPending,
    copyShareLink,
  }
}
