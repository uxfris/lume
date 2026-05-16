import Link from "next/link"
import { routes } from "@/lib/routes"
import { cn } from "@workspace/ui/lib/utils"
import type { LegalSection } from "../_lib/legal"
import { LEGAL } from "../_lib/legal"
import { LegalSectionBlock } from "./legal-section"

type LegalPageProps = {
  title: string
  description: string
  sections: LegalSection[]
  activeDoc: "terms" | "privacy"
}

export function LegalPage({
  title,
  description,
  sections,
  activeDoc,
}: LegalPageProps) {
  const contactEmail =
    activeDoc === "privacy" ? LEGAL.privacyEmail : LEGAL.contactEmail

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href={routes.authentication}
            className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            {LEGAL.productName}
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href={routes.term}
              className={cn(
                "transition-colors hover:text-foreground",
                activeDoc === "terms"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Terms
            </Link>
            <Link
              href={routes.privacy}
              className={cn(
                "transition-colors hover:text-foreground",
                activeDoc === "privacy"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Legal
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Effective {LEGAL.effectiveDate}. Questions?{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              {contactEmail}
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <aside className="lg:w-52 lg:shrink-0">
            <nav aria-label="Table of contents" className="lg:sticky lg:top-24">
              <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                On this page
              </p>
              <ol className="space-y-2 text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 flex-1">
            {sections.map((section) => (
              <LegalSectionBlock key={section.id} section={section} />
            ))}
          </article>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {LEGAL.companyName}. All rights
            reserved.
          </p>
          <p>
            {activeDoc === "terms" ? (
              <>
                See also our{" "}
                <Link
                  href={routes.privacy}
                  className="underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
              </>
            ) : (
              <>
                See also our{" "}
                <Link
                  href={routes.term}
                  className="underline underline-offset-4"
                >
                  Terms of Service
                </Link>
              </>
            )}
          </p>
        </div>
      </footer>
    </div>
  )
}
