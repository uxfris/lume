import Link from "next/link"
import LogoIcon from "@/assets/icons/logo-icon"
import { routes } from "@/lib/routes"
import { Button } from "@workspace/ui/components/button"
import { MARKETING_NAV } from "../_lib/marketing-nav"
import { MarketingNavLinks } from "./marketing-nav-links"

type MarketingShellProps = {
  children: React.ReactNode
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            href={routes.home}
            className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            <LogoIcon className="size-6" />
            <span>Lume</span>
          </Link>

          <MarketingNavLinks />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href={routes.authentication}>Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={routes.authentication}>Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3 lg:col-span-2">
              <Link href={routes.home} className="flex items-center gap-2 font-semibold">
                <LogoIcon className="size-5" />
                Lume
              </Link>
              <p className="max-w-xs text-sm text-muted-foreground">
                Meeting intelligence for small teams.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {MARKETING_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Legal
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href={routes.privacy}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href={routes.marketing.security}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href={routes.term}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Lume. All rights reserved.</p>
            <p className="sm:text-right">
              <Link
                href={routes.authentication}
                className="underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
