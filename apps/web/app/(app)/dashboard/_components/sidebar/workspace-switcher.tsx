"use client"

import { Bolt, Settings, UserPlusRounded } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
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
import { Badge } from "@workspace/ui/components/badge"
import { ChevronDown, Plus, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { CreditLeftCard } from "@/components/credit-left-card"
import { workspaceApi } from "@workspace/api-client"
import type { WorkspaceMembership } from "@workspace/types"
import { NewWorkspacePage } from "./new-workspace-page"
import { resolveInitialWorkspaceId } from "@/lib/workspace"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { routes } from "@/lib/routes"

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "W"
}

export function WorkspaceSwitcher() {
  const { workspaceId, setWorkspaceId } = useCurrentWorkspace()
  const [workspaces, setWorkspaces] = useState<WorkspaceMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeWorkspace =
    workspaces.find((item) => item.id === workspaceId) ?? workspaces[0]

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const data = await workspaceApi.getMe()
        if (!mounted) return

        setWorkspaces(data.workspaces)

        const selectedId = resolveInitialWorkspaceId({
          workspaces: data.workspaces,
          activeWorkspaceId: data.activeWorkspaceId,
          persistedWorkspaceId: workspaceId,
        })

        setWorkspaceId(selectedId || null)
      } catch {
        if (!mounted) return
        setError("Unable to load your workspaces.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false)

  function handleWorkspaceChange(nextWorkspaceId: string) {
    setWorkspaceId(nextWorkspaceId)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="bg-background py-3">
              <div className="flex aspect-square size-8 items-center justify-center">
                <span
                  className="-ml-4 flex size-6 items-center justify-center rounded-[4px] bg-primary text-center text-xs font-medium text-primary-foreground"
                  aria-hidden="true"
                >
                  {getInitial(activeWorkspace?.name ?? "Workspace")}
                </span>
              </div>
              <span className="flex-1 truncate font-medium group-data-[state=collapsed]:hidden">
                {activeWorkspace?.name ?? "Workspace"}
              </span>
              <ChevronDown className="ml-auto group-data-[state=collapsed]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="py-2 shadow-md ring-border">
            <div className="flex flex-col items-center gap-4 px-1">
              {/* Workspace */}
              <div className="flex w-full items-center gap-3">
                {/* Avatar */}
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-primary text-center font-medium text-primary-foreground"
                  aria-hidden="true"
                >
                  {getInitial(activeWorkspace?.name ?? "Workspace")}
                </div>
                {/* Workspace name */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {activeWorkspace?.name ?? "Workspace"}
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      Free Plan
                    </span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                    <span className="text-xs text-muted-foreground">
                      1 member
                    </span>
                  </div>
                </div>
              </div>
              {/* Menu */}
              <div className="flex w-full items-center gap-1">
                <Link href={routes.settings.workspace}>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="px-2 text-[11px]"
                  >
                    <span>
                      {" "}
                      <Settings />
                    </span>
                    Settings
                  </Button>
                </Link>
                <Link href={`${routes.settings.people}?invite=true`}>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="px-2 text-[11px]"
                  >
                    <UserPlusRounded />
                    Invite members
                  </Button>
                </Link>
              </div>
            </div>
            <DropdownMenuSeparator className="my-2" />
            {/* Credit */}
            <div className="flex flex-col gap-2 px-1">
              {/* Upgrade button. Visibility depends on the workspace ownerships*/}
              <div className="flex items-center justify-between rounded-sm bg-secondary p-3">
                <div className="flex items-center gap-1">
                  <Bolt weight="Bold" size={20} />
                  <span className="text-sm font-medium">Turn Pro</span>
                </div>
                <Button size="sm">Upgrade</Button>
              </div>
              {/* Credit left */}
              <CreditLeftCard />
            </div>
            <DropdownMenuSeparator className="my-2" />
            {/* Workspaces */}
            <div className="flex flex-col gap-3 py-2">
              <DropdownMenuLabel className="px-4">
                All workspace
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={workspaceId ?? ""}
                onValueChange={handleWorkspaceChange}
              >
                {loading && (
                  <p className="px-4 text-xs text-muted-foreground">
                    Loading...
                  </p>
                )}
                {!loading && !error && workspaces.length === 0 && (
                  <p className="px-4 text-xs text-muted-foreground">
                    No workspace yet.
                  </p>
                )}
                {error && (
                  <p className="px-4 text-xs text-muted-foreground">{error}</p>
                )}
                {!loading &&
                  workspaces.map((item) => (
                    <DropdownMenuRadioItem
                      key={item.id}
                      value={item.id}
                      className="mx-1 px-2 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-primary text-center text-xs font-medium text-primary-foreground!"
                          aria-hidden="true"
                        >
                          {getInitial(item.name)}
                        </span>
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
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-muted-foreground brightness-95">
                <Plus size={16} />
              </span>
              <span className="text-xs">Create new workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      {newWorkspaceOpen && (
        <NewWorkspacePage
          setWorkspaces={(next) => setWorkspaces((curr) => [next, ...curr])}
          handleWorkspaceChange={(id) => handleWorkspaceChange(id)}
          setNewWorkspaceOpen={(open) => setNewWorkspaceOpen(open)}
        />
      )}
    </SidebarMenu>
  )
}
