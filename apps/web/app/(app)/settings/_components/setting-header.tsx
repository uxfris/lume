import { routes } from "@/lib/routes"
import { AltArrowLeft } from "@solar-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export function SettingHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <>
      <div className="fixed top-0 z-50 w-full bg-background py-4">
        <div className="relative flex items-center md:hidden">
          <Button variant="ghost" asChild>
            <Link href={routes.settings.root}>
              <AltArrowLeft />
              Settings
            </Link>
          </Button>
          <span className="absolute left-1/2 -translate-x-1/2 font-semibold">
            {title}
          </span>
        </div>
      </div>
      <div className="hidden space-y-2 md:block">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </>
  )
}
