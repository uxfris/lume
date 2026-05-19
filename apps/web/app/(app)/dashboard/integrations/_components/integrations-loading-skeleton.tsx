import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

function IntegrationCardSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex h-full w-full flex-col gap-6 px-6 py-2">
        <div className="flex justify-between">
          <Skeleton className="size-12 rounded-lg" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </CardContent>
    </Card>
  )
}

function IntegrationToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-start gap-3 px-4 md:px-10 lg:flex-nowrap lg:items-center">
      <div className="flex flex-1 flex-col items-start gap-3 md:flex-row md:items-center">
        <Skeleton className="h-10 w-full rounded-md lg:w-64" />
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      <Skeleton className="h-10 w-10 rounded-md" />
    </div>
  )
}

export function IntegrationsPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden pt-4 md:pt-10">
      <div className="space-y-6">
        <Skeleton className="mx-4 hidden h-5 w-28 md:mx-10 md:block" />
        <IntegrationToolbarSkeleton />
      </div>
      <div className="no-scrollbar h-full overflow-y-auto px-4 pt-6 pb-20 md:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <IntegrationCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
