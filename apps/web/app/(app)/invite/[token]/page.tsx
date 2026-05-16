"use client"

import { useEffect, useRef, type ReactNode } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { routes } from "@/lib/routes"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { useSetWorkspaceMutation } from "@/app/(app)/settings/workspace/_hooks/mutations/use-set-workspace-mutation"
import { useAcceptInvitationMutation } from "../_hooks/use-accept-invitation-mutation"
import { getInviteErrorMessage } from "../_lib/invite-errors"
import LogoIcon from "@/assets/icons/logo-icon"
import { Spinner } from "@workspace/ui/components/spinner"
import { Button } from "@workspace/ui/components/button"

export default function AcceptInvitePage() {
  const router = useRouter()
  const params = useParams<{ token: string }>()
  const token = params.token?.trim() ?? ""
  const invitePath = token ? routes.invite(token) : routes.dashboard.root

  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { setWorkspaceId } = useCurrentWorkspace()
  const { setWorkspace } = useSetWorkspaceMutation()
  const { acceptInvite, isPending, isSuccess, isError, error } =
    useAcceptInvitationMutation()
  const hasStartedAccept = useRef(false)

  useEffect(() => {
    if (isSessionPending || !token) return

    if (!session) {
      router.replace(
        `${routes.authentication}?next=${encodeURIComponent(invitePath)}`
      )
      return
    }

    if (hasStartedAccept.current || isPending || isSuccess) {
      return
    }

    hasStartedAccept.current = true

    acceptInvite(token, {
      onSuccess: (result) => {
        setWorkspaceId(result.workspaceId)
        setWorkspace({ workspaceId: result.workspaceId })

        toast.success(
          result.workspaceName
            ? `Joined "${result.workspaceName}"`
            : "You've joined the workspace"
        )

        router.replace(routes.dashboard.root)
        router.refresh()
      },
      onError: (inviteError) => {
        toast.error(getInviteErrorMessage(inviteError))
      },
    })
  }, [
    acceptInvite,
    invitePath,
    isPending,
    isSessionPending,
    isSuccess,
    router,
    session,
    setWorkspace,
    setWorkspaceId,
    token,
  ])

  if (!token) {
    return (
      <InviteStatus
        title="Invalid invitation"
        description="This invitation link is missing a token."
        action={
          <Button asChild>
            <Link href={routes.dashboard.root}>Go to dashboard</Link>
          </Button>
        }
      />
    )
  }

  if (isError) {
    return (
      <InviteStatus
        title="Couldn't join workspace"
        description={getInviteErrorMessage(error)}
        action={
          <Button asChild>
            <Link href={routes.dashboard.root}>Go to dashboard</Link>
          </Button>
        }
      />
    )
  }

  return (
    <InviteStatus
      title="Joining workspace"
      description="We're confirming your invitation. This only takes a moment."
      loading
    />
  )
}

function InviteStatus({
  title,
  description,
  loading,
  action,
}: {
  title: string
  description: string
  loading?: boolean
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <LogoIcon className="h-12 w-12 text-primary" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {loading && <Spinner className="size-6" />}
        {action}
      </div>
    </div>
  )
}
