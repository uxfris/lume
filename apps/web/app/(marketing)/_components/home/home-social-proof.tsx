import { HOME_COPY } from "../../_lib/home-copy"

export function HomeSocialProof() {
  return (
    <section className="border-y border-border/60 py-10">
      <p className="text-center text-sm text-muted-foreground">
        {HOME_COPY.socialProof.line}
      </p>
    </section>
  )
}
