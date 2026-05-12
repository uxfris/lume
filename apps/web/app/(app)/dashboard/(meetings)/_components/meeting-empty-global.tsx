import LogoIcon from "@/assets/icons/logo-icon"
import { routes } from "@/lib/routes"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

type Variant = "starred" | "created" | "shared"

const contentMap = {
  starred: {
    description: "Star meetings to access them quickly from any workspace",
    showBrowse: true,
  },
  created: {
    description: "Create your first meeting to get started",
    showBrowse: false,
  },
  shared: {
    description: "Shared meetings will appear here",
    showBrowse: false,
  },
}

export function MeetingEmptyGlobal({ variant }: { variant: Variant }) {
  const { description, showBrowse } = contentMap[variant]

  return (
    <div className="h-full px-4 pb-4 md:px-10 md:py-10">
      <div className="flex h-full flex-col items-center justify-center gap-8 rounded-md bg-card pb-10">
        <LogoIcon className="h-12 w-12" />
        <h1 className="max-w-64 text-center text-xl font-semibold">
          {description}
        </h1>
        {showBrowse && (
          <Button variant="outline" asChild>
            <Link href={routes.dashboard.meetings.root}>Browse meetings</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
