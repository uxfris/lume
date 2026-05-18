import type { Metadata } from "next"
import { MarketingShell } from "./_components/marketing-shell"
import { HomeCapabilities } from "./_components/home/home-capabilities"
import { HomeFaq } from "./_components/home/home-faq"
import { HomeFinalCta } from "./_components/home/home-final-cta"
import { HomeHero } from "./_components/home/home-hero"
import { HomeHowItWorks } from "./_components/home/home-how-it-works"
import { HomeIntegrationsTeaser } from "./_components/home/home-integrations-teaser"
import { HomeLogoBar } from "./_components/home/home-logo-bar"
import { HomePricingTeaser } from "./_components/home/home-pricing-teaser"
import { HomeSocialProof } from "./_components/home/home-social-proof"
import { HomeWhySwitch } from "./_components/home/home-why-switch"

export const metadata: Metadata = {
  title: "Lume — Meeting notes, action items, and search for small teams",
  description:
    "Join Zoom, Meet, or Teams calls with Lume. Get transcripts, AI summaries, and tasks synced to Linear and Slack. Start free.",
  openGraph: {
    title: "Your meetings, remembered.",
    description: "Modern meeting intelligence. Free to start.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <MarketingShell>
      <HomeHero />
      <HomeLogoBar />
      <HomeWhySwitch />
      <HomeHowItWorks />
      <HomeCapabilities />
      <HomeSocialProof />
      <HomeIntegrationsTeaser />
      <HomePricingTeaser />
      <HomeFaq />
      <HomeFinalCta />
    </MarketingShell>
  )
}
