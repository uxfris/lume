import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

function IntegrationHeaderSkeleton() {
  return (
    <div className="-ml-4 hidden items-center gap-3 md:flex">
      <Skeleton className="size-9 rounded-md" />
      <Skeleton className="size-5 rounded-sm" />
      <Skeleton className="h-5 w-16" />
    </div>
  )
}

function IntegrationHeroSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col items-start justify-between gap-4 md:flex-row">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  )
}

function IntegrationConnectCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  )
}

function IntegrationFeatureRowSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <Skeleton className="size-12 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function IntegrationFeaturesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-28" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <IntegrationFeatureRowSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

function IntegrationSlackPreviewSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-16" />
      <div className="space-y-3 rounded-lg border border-foreground/5 bg-secondary p-3">
        <Skeleton className="h-3 w-40" />
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-6 rounded-sm" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function IntegrationFooterSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

type IntegrationDetailSkeletonProps = {
  showPreview?: boolean
}

export function IntegrationDetailSkeleton({
  showPreview = false,
}: IntegrationDetailSkeletonProps) {
  return (
    <div className="space-y-5 overflow-y-scroll p-4 md:p-10">
      <IntegrationHeaderSkeleton />
      <div className="mx-auto max-w-[640px] space-y-5">
        <IntegrationHeroSkeleton />
        <IntegrationConnectCardSkeleton />
        <IntegrationFeaturesSkeleton />
        {showPreview ? <IntegrationSlackPreviewSkeleton /> : null}
        <IntegrationFooterSkeleton />
      </div>
    </div>
  )
}
