import Link from "next/link"
import {
  Database,
  HardDrive,
  Lock,
  Scale,
  Sparkles,
  Users,
} from "lucide-react"
import { routes } from "@/lib/routes"
import { SECURITY_CONTACT_EMAIL, SECURITY_COPY } from "../../_lib/security-copy"

const SECTION_ICONS = [
  HardDrive,
  Database,
  Users,
  Sparkles,
  Lock,
  Scale,
] as const

export function SecurityContent() {
  const { sections, contact } = SECURITY_COPY

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        <aside className="lg:w-52 lg:shrink-0">
          <nav aria-label="Security topics" className="lg:sticky lg:top-24">
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

        <article className="min-w-0 flex-1 space-y-10">
          {sections.map((section, index) => {
            const Icon = SECTION_ICONS[index] ?? Lock

            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-xl border border-border/60 bg-card p-6 md:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 space-y-3">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {section.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                    {"contactLink" in section && section.contactLink ? (
                      <p className="text-sm">
                        <a
                          href={`mailto:${SECURITY_CONTACT_EMAIL}`}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {SECURITY_CONTACT_EMAIL}
                        </a>
                      </p>
                    ) : null}
                    {section.id === "ai-processing" || section.id === "retention" ? (
                      <p className="text-sm text-muted-foreground">
                        Details in our{" "}
                        <Link
                          href={routes.privacy}
                          className="text-foreground underline underline-offset-4"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            )
          })}

          <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={routes.privacy}
              className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              {contact.privacyLink} →
            </Link>
            <p className="text-sm text-muted-foreground">
              {contact.contactLabel}:{" "}
              <a
                href={`mailto:${SECURITY_CONTACT_EMAIL}`}
                className="text-foreground underline underline-offset-4"
              >
                {SECURITY_CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}
