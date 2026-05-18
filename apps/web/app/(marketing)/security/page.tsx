import type { Metadata } from "next"
import { routes } from "@/lib/routes"
import { MarketingShell } from "../_components/marketing-shell"
import { MarketingPageHero } from "../_components/marketing-page-hero"
import { SecurityContent } from "../_components/security/security-content"
import { SecurityFinalCta } from "../_components/security/security-final-cta"
import { SECURITY_COPY } from "../_lib/security-copy"

export const metadata: Metadata = {
  title: "Security — How Lume protects your meetings | Lume",
  description:
    "Learn how Lume stores, encrypts, and processes meeting recordings, transcripts, and AI outputs.",
  openGraph: {
    title: "How Lume protects your meeting data",
    description: "Plain facts about storage, access, AI processing, and retention.",
    type: "website",
  },
}

export default function SecurityPage() {
  const { hero } = SECURITY_COPY

  return (
    <MarketingShell>
      <MarketingPageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subhead={hero.subhead}
        ctaPrimary={{ label: "Start free", href: routes.authentication }}
        ctaSecondary={{ label: "Privacy Policy", href: routes.privacy }}
        className="pb-8 md:pb-10"
      />

      <p className="mx-auto max-w-3xl px-6 pb-4 text-center text-xs text-muted-foreground">
        {hero.lastUpdatedLabel} {hero.lastUpdated}
      </p>

      <SecurityContent />
      <SecurityFinalCta />
    </MarketingShell>
  )
}
