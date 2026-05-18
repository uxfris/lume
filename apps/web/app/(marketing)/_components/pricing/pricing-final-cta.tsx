import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"
import { PRICING_COPY } from "../../_lib/pricing-copy"

export function PricingFinalCta() {
  const { finalCta } = PRICING_COPY

  return (
    <section className="border-t border-border/60 py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          {finalCta.headline}
        </h2>
        <Button size="lg" className="mt-8" asChild>
          <Link href={routes.authentication}>{finalCta.cta}</Link>
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">{finalCta.reassurance}</p>
      </div>
    </section>
  )
}
