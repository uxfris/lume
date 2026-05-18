import { Stars } from "@solar-icons/react/ssr"
import { cn } from "@workspace/ui/lib/utils"

type MeetingDocumentPreviewProps = {
  variant?: "hero" | "section" | "compact"
  className?: string
  showActionItems?: boolean
}

export function MeetingDocumentPreview({
  variant = "section",
  className,
  showActionItems = true,
}: MeetingDocumentPreviewProps) {
  const isHero = variant === "hero"
  const isCompact = variant === "compact"

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-primary/5",
        isHero && "max-w-4xl",
        variant === "section" && "max-w-3xl",
        isCompact && "max-w-full",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="ml-2 truncate text-xs text-muted-foreground">
          Sprint planning — Product sync
        </span>
      </div>

      <div className={cn("space-y-6", isCompact ? "p-4" : "p-5 md:p-8")}>
        {!isCompact ? (
          <div>
            <p className="text-xs text-muted-foreground">Mar 12, 2026 · 42 min</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              Sprint planning — Product sync
            </h3>
          </div>
        ) : null}

        <div className="rounded-lg bg-secondary p-4 md:p-5">
          <div className="flex items-start gap-3">
            <Stars className="size-5 shrink-0 text-primary" weight="Bold" />
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold text-primary uppercase">Overview</p>
              <p className="text-sm leading-relaxed">
                Team aligned on shipping Live Sync improvements and Linear task sync
                for the MVP launch.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Key takeaways</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Ship bot join flow before end of sprint",
              "Linear sync is the top integration priority",
            ].map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-primary">·</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {showActionItems ? (
          <div className="space-y-2 border-t border-border/60 pt-4">
            <p className="text-sm font-semibold">Action items</p>
            <ul className="space-y-2">
              {[
                { task: "Finalize landing page copy", owner: "Alex" },
                { task: "QA Linear sync on staging", owner: "Jordan" },
              ].map((item) => (
                <li
                  key={item.task}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
                >
                  <span>{item.task}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.owner}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
