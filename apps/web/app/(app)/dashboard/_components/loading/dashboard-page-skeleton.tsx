import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

function LiveSyncCardSkeleton() {
  return (
    <Card className="w-full p-0">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-md" />
          <Skeleton className="h-12 w-32 shrink-0 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

function MeetingCardSkeleton({ tall }: { tall?: boolean }) {
  return (
    <Card className="h-full p-0">
      <CardContent className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-full" />
          {tall ? (
            <>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </>
          ) : (
            <Skeleton className="h-3 w-full" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="size-8 rounded-full border-2 border-background"
              />
            ))}
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

function RecentMeetingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        <MeetingCardSkeleton />
        <MeetingCardSkeleton />
        <div className="md:col-span-2">
          <MeetingCardSkeleton tall />
        </div>
      </div>
    </div>
  )
}

function UpcomingMeetingsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="space-y-4">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <Skeleton className="h-3 w-20" />
            {Array.from({ length: groupIndex === 0 ? 2 : 1 }).map(
              (_, itemIndex) => (
                <Card key={itemIndex}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex justify-between gap-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                    <div className="flex -space-x-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="size-7 rounded-full border-2 border-background"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="flex overflow-hidden">
      <div className="flex-1 space-y-8 overflow-y-auto px-4 py-8 md:px-10 lg:no-scrollbar">
        <LiveSyncCardSkeleton />
        <RecentMeetingsSkeleton />
        <div className="lg:hidden">
          <UpcomingMeetingsSkeleton />
        </div>
      </div>
      <div className="hidden w-[350px] shrink-0 py-8 pr-10 lg:flex">
        <UpcomingMeetingsSkeleton />
      </div>
    </div>
  )
}
