"use client"

import { AltArrowLeft } from "@solar-icons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import {
  sections,
  SidebarItem,
  SidebarSection,
} from "../people/_lib/sidebar-data"
import { routes } from "@/lib/routes"

// --- matching logic ---
function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (pathname === routes.settings.root && href === routes.settings.workspace) {
    return true
  }

  if (exact) return pathname === href

  return pathname === href || pathname.startsWith(href + "/")
}

function SidebarItemRow({
  item,
  pathname,
  isLayout,
}: {
  item: SidebarItem
  pathname: string
  isLayout: boolean
}) {
  const active = isLayout
    ? isActivePath(pathname, item.href, item.exact)
    : false

  return (
    <li className="group/menu-item relative">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        data-active={active}
        className={cn(
          "group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-colors",
          "text-sidebar-foreground",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "data-[active=true]:bg-sidebar-accent",
          "data-[active=true]:text-sidebar-accent-foreground",
          "data-[active=true]:font-medium"
        )}
      >
        {item.avatar ? (
          <Avatar size="sm">
            <AvatarImage src={item.avatar.src} />
            <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
              {item.avatar.fallback}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="px-1 text-sidebar-foreground group-data-[active=true]/menu-button:text-sidebar-accent-foreground">
            {item.icon}
          </div>
        )}

        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  )
}

function SidebarSectionBlock({
  section,
  pathname,
  isLayout,
}: {
  section: SidebarSection
  pathname: string
  isLayout: boolean
}) {
  const sectionId = `section-${section.title
    .toLowerCase()
    .replace(/\s+/g, "-")}`

  return (
    <section aria-labelledby={sectionId} className="space-y-1">
      <h2
        id={sectionId}
        className="px-2 text-xs font-medium text-sidebar-foreground/70"
      >
        {section.title}
      </h2>

      <nav>
        <ul className="space-y-1">
          {section.items.map((item) => (
            <SidebarItemRow
              key={item.label}
              item={item}
              pathname={pathname}
              isLayout={isLayout}
            />
          ))}
        </ul>
      </nav>
    </section>
  )
}

export function SettingSidebar({ isLayout = true }: { isLayout?: boolean }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "space-y-4 bg-sidebar px-3 py-4 text-sidebar-foreground",
        isLayout ? "hidden w-[273px] md:block" : ""
      )}
    >
      {isLayout && (
        <Link
          href="/dashboard"
          className="mb-4 flex w-fit items-center justify-start gap-2 rounded-md py-2 pr-4 pl-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <AltArrowLeft />
          <span className="text-sm font-medium">Go back</span>
        </Link>
      )}
      {sections.map((section) => (
        <SidebarSectionBlock
          key={section.title}
          section={section}
          pathname={pathname}
          isLayout={isLayout}
        />
      ))}
    </aside>
  )
}
