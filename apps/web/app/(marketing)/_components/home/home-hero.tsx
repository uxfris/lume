import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"
import { HOME_COPY } from "../../_lib/home-copy"
import { HomeProductPreview } from "./home-product-preview"

export function HomeHero() {
  const { hero } = HOME_COPY

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.44_0.04_170/0.18),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-5xl md:leading-[1.1]">
            {hero.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            {hero.subhead}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={routes.authentication}>{hero.ctaPrimary}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={routes.marketing.howItWorks}>
                {hero.ctaSecondary}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{hero.reassurance}</p>
        </div>

        <div className="mt-12 md:mt-16">
          <HomeProductPreview variant="hero" />
        </div>
      </div>
    </section>
  )
}
