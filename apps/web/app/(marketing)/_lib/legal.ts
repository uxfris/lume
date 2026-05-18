export const LEGAL = {
  productName: "Lume",
  companyName: "Lume",
  contactEmail: "legal@lume.ai",
  privacyEmail: "privacy@lume.ai",
  effectiveDate: "May 16, 2026",
  governingLaw: "the State of Delaware, United States",
} as const

export type LegalSection = {
  id: string
  title: string
  paragraphs?: string[]
  list?: string[]
  subsections?: {
    title: string
    paragraphs?: string[]
    list?: string[]
  }[]
}
