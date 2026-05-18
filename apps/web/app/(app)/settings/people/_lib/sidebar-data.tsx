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
  workspaceAvatarSrc?: string
  accountName: string
  canManageMembers?: boolean
  canManageBilling?: boolean
}): SidebarSection[] {
  const workspaceItems: SidebarItem[] = [
    {
      label: input.workspaceName,
      href: routes.settings.workspace,
      avatar: {
        src: input.workspaceAvatarSrc,
        fallback: input.workspaceFallback,
      },
    },
  ]

  if (input.canManageMembers !== false) {
    workspaceItems.push({
      label: "People",
      href: routes.settings.people,
      icon: <UsersGroupRounded />,
    })
  }

  if (input.canManageBilling !== false) {
    workspaceItems.push({
      label: "Plans & credits",
      href: routes.settings.billing,
      icon: <Card />,
    })
  }

  return [
    {
      title: "Workspace",
      items: workspaceItems,
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
