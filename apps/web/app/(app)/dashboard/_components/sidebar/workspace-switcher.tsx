"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { WorkspaceAvatar } from "@/components/workspace-avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

import { ChevronDown, Plus } from "lucide-react"
import { Bolt, Settings, UserPlusRounded } from "@solar-icons/react"

import { CreditLeftCard } from "@/components/credit-left-card"
import { NewWorkspacePage } from "./new-workspace-page"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { routes } from "@/lib/routes"
import { useWorkspacesQuery } from "@/app/(app)/settings/workspace/_hooks/queries/use-workpsace-query"
import { useSetWorkspaceMutation } from "@/app/(app)/settings/workspace/_hooks/mutations/use-set-workspace-mutation"
import { useRouter } from "next/navigation"

export function WorkspaceSwitcher() {
  const router = useRouter()

  const { workspaceId, setWorkspaceId } = useCurrentWorkspace()
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false)

  const {
    workspaces,
    activeWorkspace,
    resolvedWorkspaceId,
    isLoading,
    errorMessage,
  } = useWorkspacesQuery({ workspaceId })

  // sync initial workspace once resolved
  useEffect(() => {
    if (resolvedWorkspaceId && workspaceId !== resolvedWorkspaceId) {
      setWorkspaceId(resolvedWorkspaceId)
    }
  }, [resolvedWorkspaceId])

  const setWorkspaceMutation = useSetWorkspaceMutation()

  function handleWorkspaceChange(id: string) {
    setWorkspaceId(id) // local/global state
    setWorkspaceMutation.setWorkspace({ workspaceId: id })
    router.refresh()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="bg-background py-3">
              <div className="flex aspect-square size-8 items-center justify-center">
                {activeWorkspace ? (
                  <WorkspaceAvatar
                    workspace={activeWorkspace}
                    className="-ml-4 size-6"
                  />
                ) : (
                  <span className="-ml-4 flex size-6 items-center justify-center rounded-[4px] bg-primary text-xs font-medium text-primary-foreground">
                    W
                  </span>
                )}
              </div>

              <span className="flex-1 truncate font-medium group-data-[state=collapsed]:hidden">
                {activeWorkspace?.name ?? "Workspace"}
              </span>

              <ChevronDown className="ml-auto group-data-[state=collapsed]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="py-2 shadow-md ring-border">
            <div className="flex flex-col items-center gap-4 px-1">
              <div className="flex w-full items-center gap-3">
                {activeWorkspace ? (
                  <WorkspaceAvatar workspace={activeWorkspace} className="h-9 w-9" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-primary text-primary-foreground text-sm font-medium">
                    W
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {activeWorkspace?.name ?? "Workspace"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Free Plan • 1 member
                  </span>
                </div>
              </div>

              <div className="flex w-full items-center gap-1">
                <Link href={routes.settings.workspace}>
                  <Button size="xs" variant="ghost">
                    <Settings />
                    Settings
                  </Button>
                </Link>

                <Link href={`${routes.settings.people}?invite=true`}>
                  <Button size="xs" variant="ghost">
                    <UserPlusRounded />
                    Invite members
                  </Button>
                </Link>
              </div>
            </div>

            <DropdownMenuSeparator className="my-2" />

            <div className="flex flex-col gap-2 px-1">
              <div className="flex items-center justify-between rounded-sm bg-secondary p-3">
                <div className="flex items-center gap-1">
                  <Bolt weight="Bold" size={20} />
                  <span className="text-sm font-medium">Turn Pro</span>
                </div>
                <Button size="sm">Upgrade</Button>
              </div>

              <CreditLeftCard />
            </div>

            <DropdownMenuSeparator className="my-2" />

            <div className="flex flex-col gap-3 py-2">
              <DropdownMenuLabel className="px-4">
                All workspace
              </DropdownMenuLabel>

              <DropdownMenuRadioGroup
                value={workspaceId ?? ""}
                onValueChange={handleWorkspaceChange}
              >
                {isLoading && (
                  <p className="px-4 text-xs text-muted-foreground">
                    Loading...
                  </p>
                )}

                {!isLoading && errorMessage && (
                  <p className="px-4 text-xs text-muted-foreground">
                    {errorMessage}
                  </p>
                )}

                {!isLoading && workspaces.length === 0 && (
                  <p className="px-4 text-xs text-muted-foreground">
                    No workspace yet.
                  </p>
                )}

                {workspaces.map((item) => (
                  <DropdownMenuRadioItem
                    key={item.id}
                    value={item.id}
                    className="mx-1 px-2 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <WorkspaceAvatar workspace={item} className="h-6 w-6" />

                      <span className="text-xs">{item.name}</span>

                      {item.role === "OWNER" && (
                        <Badge variant="secondary">Owner</Badge>
                      )}
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </div>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              className="mx-1 gap-3 px-2 py-2"
              onSelect={() => setNewWorkspaceOpen(true)}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent">
                <Plus size={16} />
              </span>
              <span className="text-xs">Create new workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {newWorkspaceOpen && (
        <NewWorkspacePage
          handleWorkspaceChange={handleWorkspaceChange}
          setNewWorkspaceOpen={setNewWorkspaceOpen}
        />
      )}
    </SidebarMenu>
  )
}
