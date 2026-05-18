import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type MarketingPageHeroProps = {
  eyebrow: string
  headline: string
  subhead: string
  ctaPrimary: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
  children?: React.ReactNode
  className?: string
}

export function MarketingPageHero({
  eyebrow,
  headline,
  subhead,
  ctaPrimary,
  ctaSecondary,
  children,
  className,
}: MarketingPageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/60",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.44_0.04_170/0.18),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 md:pb-20 md:pt-20">
        <div className={cn("mx-auto max-w-3xl", children ? "" : "text-center")}>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl md:leading-tight lg:text-5xl">
            {headline}
          </h1>
          <p
            className={cn(
              "mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base",
              children ? "" : "mx-auto"
            )}
          >
            {subhead}
          </p>
          <div
            className={cn(
              "mt-8 flex flex-col gap-3 sm:flex-row",
              children ? "" : "items-center justify-center"
            )}
          >
            <Button size="lg" asChild>
              <Link href={ctaPrimary.href}>{ctaPrimary.label}</Link>
            </Button>
            {ctaSecondary ? (
              <Button size="lg" variant="outline" asChild>
                <Link href={ctaSecondary.href}>{ctaSecondary.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>
        {children ? <div className="mt-12 md:mt-16">{children}</div> : null}
      </div>
    </section>
  )
}
