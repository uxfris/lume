"use client"

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { useTaskProductivityQuery } from "../_hooks/queries/use-task-productivity-query"

function paceMessage(pacePercent: number) {
  const amount = Math.abs(pacePercent)

  if (pacePercent > 0) {
    return (
      <>
        You&apos;re completing tasks{" "}
        <span className="font-semibold text-primary">{amount}% faster</span>{" "}
        than last week. Keep it up!
      </>
    )
  }

  if (pacePercent < 0) {
    return (
      <>
        You&apos;re completing tasks{" "}
        <span className="font-semibold text-primary">{amount}% slower</span>{" "}
        than last week.
      </>
    )
  }

  return <>You&apos;re keeping a steady pace compared to last week.</>
}

export function TaskProductivityStats() {
  const { data, isLoading, isError } = useTaskProductivityQuery()
  const stats = data?.stats ?? null
  const isEmpty = !isLoading && !isError && !stats

  return (
    <Card className="border border-border bg-secondary/40 px-5 py-8">
      <CardHeader>
        <h3 className="text-base font-semibold">Productivity Stats</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading stats...</p>
        ) : isError ? (
          <p className="text-sm text-destructive">Could not load productivity stats.</p>
        ) : (
          <>
            <div className="flex w-full gap-4">
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-semibold uppercase">Resolved</h4>
                <data className="text-2xl font-semibold text-primary">
                  {stats?.resolved ?? 0}
                </data>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-semibold uppercase">Created</h4>
                <data className="text-2xl font-semibold text-primary">
                  {stats?.created ?? 0}
                </data>
              </div>
            </div>
            <div className="space-y-4">
              <Separator className="border-muted brightness-95" />
              {isEmpty ? (
                <p className="text-muted-foreground">
                  No task data available yet. Your momentum starts with your first
                  meeting.
                </p>
              ) : stats && stats.pacePercent != null ? (
                <p className="text-muted-foreground">
                  {paceMessage(stats.pacePercent)}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Complete a few more tasks to unlock week-over-week pace insights.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
