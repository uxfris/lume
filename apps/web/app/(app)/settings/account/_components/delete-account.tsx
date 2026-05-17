"use client"

import { formatDateOnly } from "@/lib/date-format"
const ACCOUNT_DELETION_GRACE_DAYS = 7
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import type { AccountDeletionReason } from "@workspace/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { SettingSection } from "../../_components/setting-section"
import { useAccountDeletionContext } from "../_hooks/use-account-deletion-context"
import { useDeleteAccountMutation } from "../_hooks/use-delete-account-mutation"
import { ConfirmEmailDialog } from "./confirm-email-dialog"
import { ConfirmWorkspaceDeletionDialog } from "./confirm-workspace-deletion-dialog"
import { DeleteAccountDialog } from "./delete-account-dialog"
import { PendingDeletionBanner } from "./pending-deletion-banner"

function computePreviewDeletionDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + ACCOUNT_DELETION_GRACE_DAYS)
  return date.toISOString()
}

export function DeleteAccount() {
  const [flowOpen, setFlowOpen] = useState(false)
  const [openWorkspace, setOpenWorkspace] = useState(false)
  const [openEmail, setOpenEmail] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [workspaceStepIndex, setWorkspaceStepIndex] = useState(0)
  const [workspaceConfirmations, setWorkspaceConfirmations] = useState<
    Record<string, string>
  >({})
  const [emailConfirmation, setEmailConfirmation] = useState("")
  const [reason, setReason] = useState<AccountDeletionReason | null>(null)

  const { data: context, isLoading: isLoadingContext } =
    useAccountDeletionContext(true)
  const deleteAccount = useDeleteAccountMutation()

  const previewScheduledDeletionAt = useMemo(computePreviewDeletionDate, [])

  const soleOwnerWorkspaces = context?.soleOwnerWorkspaces ?? []
  const currentWorkspace = soleOwnerWorkspaces[workspaceStepIndex]
  const isPendingDeletion = Boolean(context?.scheduledDeletionAt)

  const resetFlow = useCallback(() => {
    setFlowOpen(false)
    setOpenWorkspace(false)
    setOpenEmail(false)
    setOpenDelete(false)
    setWorkspaceStepIndex(0)
    setWorkspaceConfirmations({})
    setEmailConfirmation("")
    setReason(null)
  }, [])

  const startDeletionFlow = () => {
    if (isPendingDeletion) return
    setFlowOpen(true)
    setWorkspaceStepIndex(0)
    setWorkspaceConfirmations({})
    setEmailConfirmation("")
    setReason(null)
    setOpenWorkspace(false)
    setOpenEmail(false)
    setOpenDelete(false)
  }

  useEffect(() => {
    if (!flowOpen || isLoadingContext || !context) return
    if (openWorkspace || openEmail || openDelete) return

    if (soleOwnerWorkspaces.length > 0) {
      setOpenWorkspace(true)
      return
    }

    setOpenEmail(true)
  }, [
    context,
    flowOpen,
    isLoadingContext,
    openDelete,
    openEmail,
    openWorkspace,
    soleOwnerWorkspaces.length,
  ])

  const onWorkspaceContinue = () => {
    if (!currentWorkspace) return

    const confirmedName = workspaceConfirmations[currentWorkspace.id]?.trim()
    if (confirmedName !== currentWorkspace.name) return

    if (workspaceStepIndex < soleOwnerWorkspaces.length - 1) {
      setWorkspaceStepIndex((index) => index + 1)
      return
    }

    setOpenWorkspace(false)
    setOpenEmail(true)
  }

  const onEmailContinue = () => {
    setOpenEmail(false)
    setOpenDelete(true)
  }

  const onDelete = async () => {
    if (!context || !reason) return

    const confirmedWorkspaceNames = soleOwnerWorkspaces.map(
      (workspace) => workspaceConfirmations[workspace.id]?.trim() ?? ""
    )

    try {
      const result = await deleteAccount.mutateAsync({
        email: emailConfirmation,
        confirmedWorkspaceNames,
        reason,
      })

      resetFlow()
      toast.success(
        `Account deletion scheduled for ${formatDateOnly(result.scheduledDeletionAt)}`
      )
    } catch {
      // Mutation meta surfaces API errors via the global handler.
    }
  }

  return (
    <Card className="py-2">
      {isPendingDeletion && context?.scheduledDeletionAt && (
        <PendingDeletionBanner
          email={context.email}
          scheduledDeletionAt={context.scheduledDeletionAt}
        />
      )}
      <CardContent className="px-5">
        <SettingSection
          title="Delete account"
          description={
            isPendingDeletion
              ? "Your account is scheduled for deletion. You can cancel before the grace period ends."
              : `Permanently delete your Sidereal account after a ${ACCOUNT_DELETION_GRACE_DAYS}-day grace period.`
          }
          borderBottom={false}
        >
          <span className="flex justify-end">
            <Button
              variant="destructive"
              onClick={startDeletionFlow}
              disabled={isPendingDeletion || (isLoadingContext && flowOpen)}
            >
              {isLoadingContext && flowOpen ? <Spinner /> : "Delete account"}
            </Button>
          </span>
        </SettingSection>
      </CardContent>

      {currentWorkspace && (
        <ConfirmWorkspaceDeletionDialog
          open={openWorkspace}
          onOpenChange={(open) => {
            setOpenWorkspace(open)
            if (!open) resetFlow()
          }}
          workspaceName={currentWorkspace.name}
          value={workspaceConfirmations[currentWorkspace.id] ?? ""}
          onValueChange={(value) =>
            setWorkspaceConfirmations((prev) => ({
              ...prev,
              [currentWorkspace.id]: value,
            }))
          }
          onContinue={onWorkspaceContinue}
        />
      )}

      {context && (
        <ConfirmEmailDialog
          open={openEmail}
          onOpenChange={(open) => {
            setOpenEmail(open)
            if (!open) resetFlow()
          }}
          email={context.email}
          value={emailConfirmation}
          onValueChange={setEmailConfirmation}
          onContinue={onEmailContinue}
        />
      )}

      <DeleteAccountDialog
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open)
          if (!open) resetFlow()
        }}
        scheduledDeletionAt={previewScheduledDeletionAt}
        reason={reason}
        onReasonChange={setReason}
        onDelete={onDelete}
        isPending={deleteAccount.isPending}
      />
    </Card>
  )
}
