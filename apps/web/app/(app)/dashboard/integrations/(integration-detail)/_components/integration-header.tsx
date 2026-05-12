import { routes } from "@/lib/routes"
import { ArrowLeft, LayersMinimalistic } from "@solar-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export function IntegrationHeader({ platform }: { platform: string }) {
  return (
    <div className="-ml-4 hidden items-center gap-3 md:flex">
      <Button variant="ghost" asChild>
        <Link href={routes.dashboard.integrations.root}>
          <ArrowLeft />
        </Link>
      </Button>
      <LayersMinimalistic />
      <h1 className="text-base font-semibold">{platform}</h1>
    </div>
  )
}
