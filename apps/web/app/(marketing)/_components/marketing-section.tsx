import { cn } from "@workspace/ui/lib/utils"

type MarketingSectionProps = {
  id?: string
  label?: string
  headline: string
  description?: string
  children: React.ReactNode
  className?: string
  containerClassName?: string
}

export function MarketingSection({
  id,
  label,
  headline,
  description,
  children,
  className,
  containerClassName,
}: MarketingSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 md:py-24", className)}>
      <div className={cn("mx-auto max-w-6xl px-6", containerClassName)}>
        <header className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          {label ? (
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {label}
            </p>
          ) : null}
          <h2
            className={cn(
              "text-balance font-semibold tracking-tight",
              label ? "mt-2 text-2xl md:text-3xl" : "text-2xl md:text-3xl"
            )}
          >
            {headline}
          </h2>
          {description ? (
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  )
}
