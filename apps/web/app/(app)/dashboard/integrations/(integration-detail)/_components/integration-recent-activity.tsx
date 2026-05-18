import type { IntegrationRecentActivity } from "@workspace/types"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

export function IntegrationRecentActivityCard({
  activities,
}: {
  activities: IntegrationRecentActivity[]
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs text-muted-foreground uppercase">
        Recent Activity
      </h2>
      <Card>
        <CardContent className="space-y-4">
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recent activity yet
            </p>
          )}
          {activities.length !== 0 &&
            activities.map((activity, index) => (
              <div key={activity.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs">{activity.description}</p>
                      )}
                      <span className="text-xs text-muted-foreground md:hidden">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                  <span className="hidden text-xs text-muted-foreground md:block">
                    {activity.timestamp}
                  </span>
                </div>
                {index !== activities.length - 1 && <Separator />}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
