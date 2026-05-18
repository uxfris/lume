import type { Metadata } from "next"
import { LegalPage } from "../_components/legal-page"
import { TERMS_SECTIONS } from "../_content/terms-of-service"
import { LEGAL } from "../_lib/legal"

export const metadata: Metadata = {
  title: `Terms of Service | ${LEGAL.productName}`,
  description: `Terms governing your use of ${LEGAL.productName}, including meeting recording, workspaces, subscriptions, and acceptable use.`,
}

export default function TermPage() {
  return (
    <LegalPage
      activeDoc="terms"
      title="Terms of Service"
      description={`Please read these terms carefully before using ${LEGAL.productName}. They explain your rights and responsibilities when using our meeting intelligence platform.`}
      sections={TERMS_SECTIONS}
    />
  )
}
