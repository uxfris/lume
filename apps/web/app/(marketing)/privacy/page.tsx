import type { Metadata } from "next"
import { LegalPage } from "../_components/legal-page"
import { PRIVACY_SECTIONS } from "../_content/privacy-policy"
import { LEGAL } from "../_lib/legal"

export const metadata: Metadata = {
  title: `Privacy Policy | ${LEGAL.productName}`,
  description: `How ${LEGAL.productName} collects, uses, and protects personal information, including meeting recordings, transcripts, and AI processing.`,
}

export default function PrivacyPage() {
  return (
    <LegalPage
      activeDoc="privacy"
      title="Privacy Policy"
      description={`This policy describes how ${LEGAL.companyName} handles personal information when you use ${LEGAL.productName}, including data from meetings, calendars, and integrations.`}
      sections={PRIVACY_SECTIONS}
    />
  )
}
