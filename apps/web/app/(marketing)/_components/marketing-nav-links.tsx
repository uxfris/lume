"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { MARKETING_NAV } from "../_lib/marketing-nav"

export function MarketingNavLinks() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-6 text-sm md:flex">
      {MARKETING_NAV.map((item) => {
        const isActive =
          item.href.startsWith("/") &&
          !item.href.includes("#") &&
          pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground",
              isActive
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
