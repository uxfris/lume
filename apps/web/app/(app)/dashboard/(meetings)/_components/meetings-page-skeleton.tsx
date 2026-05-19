import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

function MeetingCardSkeleton() {
  return (
    <Card className="h-full p-0">
      <CardContent className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
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

function MeetingToolbarSkeleton({ wideSearch }: { wideSearch?: boolean }) {
  return (
    <div className="flex flex-wrap items-start gap-3 lg:flex-nowrap lg:items-center">
      <Skeleton
        className={cn(
          "h-10 w-full rounded-md",
          wideSearch ? "lg:w-96" : "lg:w-64"
        )}
      />
      <div
        className={cn(
          "grid w-full gap-2",
          wideSearch ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-6"
        )}
      >
        {Array.from({ length: wideSearch ? 5 : 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}

function MeetingChannelButtonsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-28 rounded-md" />
      ))}
    </div>
  )
}

function MeetingGridSkeleton() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <MeetingCardSkeleton key={index} />
      ))}
    </div>
  )
}

type MeetingsPageSkeletonProps = {
  showChannelButtons?: boolean
  showBackButton?: boolean
  wideSearch?: boolean
}

export function MeetingsPageSkeleton({
  showChannelButtons = false,
  showBackButton = false,
  wideSearch = false,
}: MeetingsPageSkeletonProps) {
  return (
    <div className="relative flex h-full flex-col gap-6 overflow-hidden">
      <div className="hidden items-center gap-3 px-4 pt-4 md:flex md:px-10 md:pt-10">
        {showBackButton ? <Skeleton className="size-5 rounded-sm" /> : null}
        <Skeleton className="h-5 w-40" />
        {showChannelButtons || showBackButton ? (
          <Skeleton className="size-5 rounded-sm" />
        ) : null}
      </div>
      <div className="space-y-4 overflow-y-auto px-4 pb-10 md:space-y-10 md:px-10">
        <div className="space-y-3">
          <MeetingToolbarSkeleton wideSearch={wideSearch} />
          {showChannelButtons ? <MeetingChannelButtonsSkeleton /> : null}
        </div>
        <MeetingGridSkeleton />
      </div>
    </div>
  )
}
