import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"
import { HOME_COPY } from "../../_lib/home-copy"

export function HomeFinalCta() {
  const { finalCta } = HOME_COPY

  return (
    <section className="border-t border-border/60 py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          {finalCta.headline}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          {finalCta.subhead}
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href={routes.authentication}>{finalCta.cta}</Link>
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">{finalCta.reassurance}</p>
      </div>
    </section>
  )
}
