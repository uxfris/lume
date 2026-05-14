"use client"

import { Button } from "@workspace/ui/components/button"
import { X } from "lucide-react"
import React, { useState } from "react"
import LogoIcon from "@/assets/icons/logo-icon"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

import { useCreateWorkspaceMutation } from "@/app/(app)/settings/workspace/_hooks/mutations/use-create-workspace-mutation"
import { toast } from "sonner"

export function NewWorkspacePage({
  handleWorkspaceChange,
  setNewWorkspaceOpen,
}: {
  handleWorkspaceChange: (id: string) => void
  setNewWorkspaceOpen: (open: boolean) => void
}) {
  const [newWorkspaceName, setNewWorkspaceName] = useState("")

  const createWorkspace = useCreateWorkspaceMutation()

  async function handleCreateWorkspace() {
    const name = newWorkspaceName.trim()
    if (!name) return

    createWorkspace.create(
      { name },
      {
        onSuccess: (workspace) => {
          toast.success(`Workspace "${workspace.name}" created`)
          handleWorkspaceChange(workspace.id)
          setNewWorkspaceName("")
          setNewWorkspaceOpen(false)
        },
        onError: () => {
          toast.error("Failed to create workspace")
        },
      }
    )
  }

  const creating = createWorkspace.isPending
  const error = createWorkspace.error ? "Failed to create workspace." : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex max-w-xs flex-col gap-6">
        <Button
          variant="ghost"
          className="absolute top-6 right-4"
          onClick={() => setNewWorkspaceOpen(false)}
        >
          <X />
        </Button>

        <LogoIcon className="h-12 w-12 text-primary" />

        <h1 className="text-3xl font-semibold">Create a workspace</h1>

        <p className="text-sm">
          Create a new place to make meetings or collaborate with others.
        </p>

        <Field>
          <FieldLabel>Workspace name</FieldLabel>
          <Input
            placeholder="Enter workspace name"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
        </Field>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setNewWorkspaceOpen(false)}
          >
            Go back
          </Button>

          <Button
            className="flex-1"
            onClick={handleCreateWorkspace}
            disabled={creating || newWorkspaceName.trim().length === 0}
          >
            {creating ? "Creating..." : "Create workspace"}
          </Button>
        </div>
      </div>
    </div>
  )
}
