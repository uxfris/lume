import { Spinner } from "@workspace/ui/components/spinner"

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  )
}
