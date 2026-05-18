import type { Metadata } from "next"
import { MarketingShell } from "../_components/marketing-shell"
import { MarketingPageHero } from "../_components/marketing-page-hero"
import {
  ProductActionItemsSection,
  ProductFinalCta,
  ProductLiveSyncSection,
  ProductMeetingDocumentSection,
  ProductSearchSection,
  ProductSecurityCallout,
  ProductUploadsSection,
  ProductWorkspacesSection,
} from "../_components/product/product-sections"
import { MeetingDocumentPreview } from "../_components/shared/meeting-document-preview"
import { PRODUCT_COPY } from "../_lib/product-copy"
import { routes } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Product — Live Sync, AI notes, and task sync | Lume",
  description:
    "Record or upload meetings, get transcripts and summaries, extract action items, and sync to Linear and Slack.",
  openGraph: {
    title: "Everything after the meeting ends | Lume",
    description:
      "Live Sync, AI meeting documents, action items, and workspace search.",
    type: "website",
  },
}

export default function ProductPage() {
  const { hero } = PRODUCT_COPY

  return (
    <MarketingShell>
      <MarketingPageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subhead={hero.subhead}
        ctaPrimary={{ label: hero.ctaPrimary, href: routes.authentication }}
        ctaSecondary={{ label: hero.ctaSecondary, href: routes.marketing.pricing }}
      >
        <MeetingDocumentPreview variant="hero" className="mx-auto" />
      </MarketingPageHero>

      <ProductLiveSyncSection />
      <ProductUploadsSection />
      <ProductMeetingDocumentSection />
      <ProductActionItemsSection />
      <ProductSearchSection />
      <ProductWorkspacesSection />
      <ProductSecurityCallout />
      <ProductFinalCta />
    </MarketingShell>
  )
}
