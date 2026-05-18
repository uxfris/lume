import { cn } from "@workspace/ui/lib/utils"

type MarketingFeatureRowProps = {
  id?: string
  label: string
  headline: string
  body: string
  note?: string
  visual: React.ReactNode
  reversed?: boolean
  className?: string
  footer?: React.ReactNode
}

export function MarketingFeatureRow({
  id,
  label,
  headline,
  body,
  note,
  visual,
  reversed = false,
  className,
  footer,
}: MarketingFeatureRowProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 md:py-20", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div className={cn("space-y-4", reversed && "lg:order-2")}>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            {label}
          </p>
          <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            {headline}
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            {body}
          </p>
          {note ? (
            <p className="text-sm text-muted-foreground/80">{note}</p>
          ) : null}
          {footer}
        </div>
        <div className={cn(reversed && "lg:order-1")}>{visual}</div>
      </div>
    </section>
  )
}
