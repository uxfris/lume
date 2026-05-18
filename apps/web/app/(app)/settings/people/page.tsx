import { Suspense } from "react"
import { Spinner } from "@workspace/ui/components/spinner"
import { PeoplePageClient } from "./_components/people-page-client"

export default function People() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center px-4 pt-20 md:p-12">
          <Spinner className="size-8" />
        </div>
      }
    >
      <PeoplePageClient />
    </Suspense>
  )
}
