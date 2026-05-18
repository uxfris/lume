import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"
import { SECURITY_COPY } from "../../_lib/security-copy"

export function SecurityFinalCta() {
  const { finalCta } = SECURITY_COPY

  return (
    <section className="border-t border-border/60 py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          {finalCta.headline}
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href={routes.authentication}>{finalCta.cta}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={routes.privacy}>{finalCta.ctaSecondary}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
