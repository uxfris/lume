import { LEGAL } from "./legal"

export const SECURITY_CONTACT_EMAIL = "security@lume.ai"

export const SECURITY_COPY = {
  hero: {
    eyebrow: "Security",
    headline: 'Your meetings deserve more than a vague "bank-level" promise.',
    subhead:
      "Plain facts about what we store, who can access it, and how AI fits in.",
    lastUpdatedLabel: "Last updated",
    lastUpdated: LEGAL.effectiveDate,
  },
  sections: [
    {
      id: "what-we-store",
      title: "What we store",
      body: "Meeting audio, transcripts, AI-generated summaries and action items, and search embeddings derived from your content. Account and workspace metadata needed to run the product.",
    },
    {
      id: "where-it-lives",
      title: "Where it lives",
      body: "Data is stored in secure cloud infrastructure (e.g. encrypted object storage for media, PostgreSQL for application data). Data is encrypted in transit (TLS) and at rest.",
    },
    {
      id: "who-can-access",
      title: "Who can access it",
      body: "Only members of your workspace according to product permissions. Lume staff access is limited to what's required for support and operations, under internal policies.",
    },
    {
      id: "ai-processing",
      title: "AI and third-party processing",
      body: "Transcription and analysis use third-party services. We send the minimum content required to generate transcripts, summaries, and embeddings.",
    },
    {
      id: "retention",
      title: "Retention and deletion",
      body: "You can delete meetings and content from your workspace. Account closure triggers deletion per our policies. Backups may persist for a limited period.",
    },
    {
      id: "compliance",
      title: "Compliance",
      body: "We're building toward formal compliance programs. Contact us for security questionnaires or enterprise requirements.",
      contactLink: true,
    },
  ],
  contact: {
    privacyLink: "Read our Privacy Policy",
    contactLabel: "Security questions",
  },
  finalCta: {
    headline: "Questions before you connect a call?",
    cta: "Start free",
    ctaSecondary: "Read Privacy Policy",
  },
} as const
