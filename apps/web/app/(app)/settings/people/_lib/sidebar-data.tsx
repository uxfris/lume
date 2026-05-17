import { routes } from "@/lib/routes"
import { Card, UserCircle, UsersGroupRounded } from "@solar-icons/react"
import { ReactNode } from "react"

export type SidebarItem = {
  label: string
  href: string
  icon?: ReactNode
  avatar?: {
    src?: string
    fallback: string
  }
  exact?: boolean
}

export type SidebarSection = {
  title: string
  items: SidebarItem[]
}

export function createSidebarSections(input: {
  workspaceName: string
  workspaceFallback: string
  accountName: string
}): SidebarSection[] {
  return [
    {
      title: "Workspace",
      items: [
        {
          label: input.workspaceName,
          href: routes.settings.workspace,
          avatar: { fallback: input.workspaceFallback },
        },
        {
          label: "People",
          href: routes.settings.people,
          icon: <UsersGroupRounded />,
        },
        {
          label: "Plans & credits",
          href: routes.settings.billing,
          icon: <Card />,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: input.accountName,
          href: routes.settings.account,
          icon: <UserCircle />,
        },
      ],
    },
  ]
}
