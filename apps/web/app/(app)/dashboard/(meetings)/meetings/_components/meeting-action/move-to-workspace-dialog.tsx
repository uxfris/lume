// move-to-workspace-dialog.tsx

import { InfoCircle, UsersGroupRounded } from "@solar-icons/react"
import { MoveRight } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Spinner } from "@workspace/ui/components/spinner"
import { useMoveToWorkspace } from "../../_hooks/use-move-meetings-to-workspace"

export function MoveToWorkspaceDialog() {
  const {
    open,
    loading,
    selectedIds,
    selectedWorkspace,
    filteredWorkspaces,

    setSelectedWorkspace,
    moveToWorkspace,
    handleOpenChange,
  } = useMoveToWorkspace()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="xs" variant="ghost">
          <UsersGroupRounded />
          Transfer
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to workspace</DialogTitle>

          <DialogDescription>
            Select a workspace to move the selected meetings to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-64 flex-col overflow-y-auto pb-2">
          <div className="flex-1 space-y-3">
            {filteredWorkspaces.length === 0 && (
              <div className="flex h-56 flex-col items-center justify-center gap-6">
                <div className="space-y-2 text-center">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    No other workspace available
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    To move meetings, you must first create a new workspace.
                  </p>
                </div>
              </div>
            )}

            {filteredWorkspaces.map((workspace) => (
              <Button
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace)}
                variant={
                  selectedWorkspace?.id === workspace.id
                    ? "secondary"
                    : "outline"
                }
                className="w-full justify-start"
              >
                {workspace.name}
              </Button>
            ))}
          </div>
        </div>

        {filteredWorkspaces.length > 0 && (
          <div className="flex items-center gap-2">
            <InfoCircle />

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} meeting
                {selectedIds.length > 1 ? "s" : ""} selected
              </span>

              <MoveRight size={12} />

              <span className="text-sm font-semibold text-muted-foreground">
                {selectedWorkspace?.name}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>

            <Button
              onClick={moveToWorkspace}
              disabled={!selectedWorkspace || loading}
            >
              {loading ? <Spinner /> : "Move to workspace"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
