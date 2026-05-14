import { Spinner } from "@workspace/ui/components/spinner"

export default function GlobalLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  )
}
