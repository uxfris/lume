"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { ActionItem } from "@workspace/types"
import { integrationsApi } from "@workspace/api-client"
import { useSyncTasksToLinearMutation } from "../_hooks/mutations/use-sync-tasks-to-linear-mutation"
import { toast } from "sonner"

type SendTaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (created: number) => void
  tasks: ActionItem[]
  meetingTitle: string
}

export function SendTaskDialog({
  open,
  onOpenChange,
  onSuccess,
  tasks,
  meetingTitle,
}: SendTaskDialogProps) {
  const [teamId, setTeamId] = useState<string>("")
  const syncMutation = useSyncTasksToLinearMutation()

  const teamsQuery = useQuery({
    queryKey: ["integrations", "linear", "teams"],
    queryFn: () => integrationsApi.listChannels("linear"),
    enabled: open,
    staleTime: 60_000,
  })

  const teams = teamsQuery.data?.channels ?? []

  useEffect(() => {
    if (!open) {
      setTeamId("")
      return
    }
    if (teams.length > 0 && !teamId) {
      setTeamId(teams[0]!.id)
    }
  }, [open, teams, teamId])

  const handleSubmit = async () => {
    if (!teamId) {
      toast.error("Choose a Linear team to continue.")
      return
    }

    try {
      const result = await syncMutation.mutateAsync({
        taskIds: tasks.map((task) => task.id),
        teamId,
        meetingTitle,
      })
      onSuccess(result.created)
    } catch {
      toast.error("Failed to send tasks to Linear. Try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image
              src="/vectors/linear-app.svg"
              alt=""
              width={20}
              height={20}
            />
            Send {tasks.length} task{tasks.length === 1 ? "" : "s"} to Linear
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="space-y-6 py-2">
          <Field className="gap-3">
            <FieldLabel htmlFor="linear-team">Team</FieldLabel>
            {teamsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading teams...</p>
            ) : teamsQuery.isError || teams.length === 0 ? (
              <p className="text-sm text-destructive">
                Could not load Linear teams. Check your connection.
              </p>
            ) : (
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger id="linear-team" className="w-full bg-input">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </Field>
        </div>
        <DialogFooter>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost" type="button">
                Close
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={
                syncMutation.isPending ||
                teamsQuery.isLoading ||
                teams.length === 0 ||
                !teamId
              }
            >
              {syncMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
