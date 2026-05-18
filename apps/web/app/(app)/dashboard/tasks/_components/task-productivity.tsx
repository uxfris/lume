import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

export function TaskProductivityStats() {
  const isEmpty = true
  return (
    <Card className="border border-border bg-secondary/40 px-5 py-8">
      <CardHeader>
        <h3 className="text-base font-semibold">Productivity Stats</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex w-full gap-4">
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-semibold uppercase">Resolved</h4>
            <data className="text-2xl font-semibold text-primary">14</data>
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-semibold uppercase">Creeated</h4>
            <data className="text-2xl font-semibold text-primary">32</data>
          </div>
        </div>
        <div className="space-y-4">
          <Separator className="border-muted brightness-95" />
          {isEmpty ? (
            <p className="text-muted-foreground">
              No task data available yet. Your momentum starts with your first
              meeting.
            </p>
          ) : (
            <p className="text-muted-foreground">
              You're completing tasks{" "}
              <span className="font-semibold text-primary">15% faster</span>{" "}
              than last week. Keep it up!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
