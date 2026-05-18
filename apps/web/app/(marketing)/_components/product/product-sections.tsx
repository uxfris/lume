import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"
import { MarketingFeatureRow } from "../marketing-feature-row"
import { PRODUCT_COPY } from "../../_lib/product-copy"
import {
  ActionItemsVisual,
  LiveSyncVisual,
  MeetingDocumentVisual,
  SearchVisual,
  UploadVisual,
  WorkspacesVisual,
} from "./product-visuals"

export function ProductLiveSyncSection() {
  const { liveSync } = PRODUCT_COPY

  return (
    <MarketingFeatureRow
      id="live-sync"
      label={liveSync.label}
      headline={liveSync.headline}
      body={liveSync.body}
      note={liveSync.note}
      visual={<LiveSyncVisual />}
    />
  )
}

export function ProductUploadsSection() {
  const { uploads } = PRODUCT_COPY

  return (
    <MarketingFeatureRow
      label={uploads.label}
      headline={uploads.headline}
      body={uploads.body}
      visual={<UploadVisual />}
      reversed
      className="bg-muted/30"
    />
  )
}

export function ProductMeetingDocumentSection() {
  const { meetingDocument } = PRODUCT_COPY

  return (
    <MarketingFeatureRow
      label={meetingDocument.label}
      headline={meetingDocument.headline}
      body={meetingDocument.body}
      visual={<MeetingDocumentVisual />}
    />
  )
}

export function ProductActionItemsSection() {
  const { actionItems } = PRODUCT_COPY

  return (
    <MarketingFeatureRow
      label={actionItems.label}
      headline={actionItems.headline}
      body={actionItems.body}
      visual={<ActionItemsVisual />}
      reversed
      className="bg-muted/30"
      footer={
        <Link
          href={routes.marketing.integrations}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          {actionItems.link}
          <ArrowRight className="size-4" />
        </Link>
      }
    />
  )
}

export function ProductSearchSection() {
  const { search } = PRODUCT_COPY

  return (
    <MarketingFeatureRow
      label={search.label}
      headline={search.headline}
      body={search.body}
      visual={<SearchVisual />}
    />
  )
}

export function ProductWorkspacesSection() {
  const { workspaces } = PRODUCT_COPY

  return (
    <MarketingFeatureRow
      label={workspaces.label}
      headline={workspaces.headline}
      body={workspaces.body}
      visual={<WorkspacesVisual />}
      reversed
      className="bg-muted/30"
    />
  )
}

export function ProductSecurityCallout() {
  const { security } = PRODUCT_COPY

  return (
    <section className="border-y border-border/60 py-16 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-xl gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{security.headline}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {security.body}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={routes.marketing.security}>{security.link}</Link>
        </Button>
      </div>
    </section>
  )
}

export function ProductFinalCta() {
  const { finalCta } = PRODUCT_COPY

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          {finalCta.headline}
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href={routes.authentication}>{finalCta.cta}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={routes.marketing.pricing}>{finalCta.ctaSecondary}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
