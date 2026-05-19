import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

function TaskRowSkeleton() {
  return (
    <div className="flex items-start gap-3 py-1">
      <Skeleton className="size-5 shrink-0 rounded-sm" />
      <Skeleton className="h-4 flex-1 max-w-[85%]" />
      <Skeleton className="size-7 shrink-0 rounded-full" />
    </div>
  )
}

function TaskGroupSkeleton({ taskCount = 3 }: { taskCount?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex w-full items-center">
        <Skeleton className="w-1 self-stretch rounded-full" />
        <div className="w-full space-y-2 pl-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48 max-w-[60%]" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Card>
        <CardContent className="space-y-1 pt-6">
          {Array.from({ length: taskCount }).map((_, index) => (
            <TaskRowSkeleton key={index} />
          ))}
        </CardContent>
      </Card>
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
  )
}

function TaskInsightCardSkeleton() {
  return (
    <Card className="border border-accent-3/50 bg-accent-3/30 px-5 py-8">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </Card>
  )
}

function TaskProductivityCardSkeleton() {
  return (
    <Card className="border border-border bg-secondary/40 px-5 py-8">
      <Skeleton className="h-5 w-36" />
      <div className="mt-6 flex w-full gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-10" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
      <Skeleton className="mt-6 h-px w-full" />
      <Skeleton className="mt-6 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-3/4" />
    </Card>
  )
}

function TasksSidebarSkeleton() {
  return (
    <div className="hidden w-[288px] shrink-0 space-y-8 overflow-y-auto pt-7 pr-10 pb-36 md:no-scrollbar lg:block">
      <TaskInsightCardSkeleton />
      <TaskProductivityCardSkeleton />
    </div>
  )
}

export function TasksTabPanelSkeleton() {
  return (
    <div className="flex w-full flex-col overflow-hidden lg:flex-row">
      <div className="min-w-0 flex-1 space-y-10 overflow-y-auto px-4 pt-7 pb-36 md:no-scrollbar md:px-10">
        <TaskGroupSkeleton taskCount={4} />
        <TaskGroupSkeleton taskCount={2} />
      </div>
      <TasksSidebarSkeleton />
    </div>
  )
}

export function TasksPageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-hidden pt-4 md:gap-8 md:pt-10",
        className
      )}
    >
      <Skeleton className="mx-4 h-5 w-16 md:mx-10" />
      <div className="relative px-4 md:px-10">
        <div className="absolute right-0 bottom-0 left-0 h-px w-full bg-border" />
        <div className="relative flex gap-6 pb-px">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-none" />
          ))}
        </div>
      </div>
      <TasksTabPanelSkeleton />
    </div>
  )
}
