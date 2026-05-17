"use client"

import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { authClient } from "@/lib/auth-client"
import { routes } from "@/lib/routes"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import type { AccountDeletionReason } from "@workspace/types"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { SettingSection } from "../../_components/setting-section"
import { useAccountDeletionContext } from "../_hooks/use-account-deletion-context"
import { useDeleteAccountMutation } from "../_hooks/use-delete-account-mutation"
import { ConfirmEmailDialog } from "./confirm-email-dialog"
import { ConfirmWorkspaceDeletionDialog } from "./confirm-workspace-deletion-dialog"
import { DeleteAccountDialog } from "./delete-account-dialog"

export function DeleteAccount() {
  const router = useRouter()
  const { setWorkspaceId } = useCurrentWorkspace()
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
    useAccountDeletionContext(flowOpen)
  const deleteAccount = useDeleteAccountMutation()

  const soleOwnerWorkspaces = context?.soleOwnerWorkspaces ?? []
  const currentWorkspace = soleOwnerWorkspaces[workspaceStepIndex]

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
      await deleteAccount.mutateAsync({
        email: emailConfirmation,
        confirmedWorkspaceNames,
        reason,
      })

      resetFlow()
      toast.success("Your account has been deleted")

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setWorkspaceId(null)
            router.push(routes.authentication)
          },
        },
      })
    } catch {
      // Mutation meta surfaces API errors via the global handler.
    }
  }

  return (
    <Card className="py-2">
      <CardContent className="px-5">
        <SettingSection
          title="Delete account"
          description="Permanently delete your Sidereal account. This cannot be undone."
          borderBottom={false}
        >
          <span className="flex justify-end">
            <Button
              variant="destructive"
              onClick={startDeletionFlow}
              disabled={isLoadingContext && flowOpen}
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
        reason={reason}
        onReasonChange={setReason}
        onDelete={onDelete}
        isPending={deleteAccount.isPending}
      />
    </Card>
  )
}
