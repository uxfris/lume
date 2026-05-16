import type { LegalSection } from "../_lib/legal"
import { LEGAL } from "../_lib/legal"

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      `${LEGAL.companyName} ("we", "us", or "our") operates ${LEGAL.productName}, a meeting intelligence platform. This Privacy Policy explains how we collect, use, disclose, and protect personal information when you use our website, applications, and related services (the "Service").`,
      "This policy applies to visitors, account holders, and workspace members. If you access the Service through an organization, that organization may control certain workspace data; this policy describes our practices as the service provider.",
    ],
  },
  {
    id: "controller",
    title: "2. Who We Are",
    paragraphs: [
      `For purposes of applicable data protection law, ${LEGAL.companyName} is the controller of personal information processed through the Service, unless we act as a processor on behalf of your organization for workspace content you submit.`,
      `Privacy inquiries: ${LEGAL.privacyEmail}. Legal inquiries: ${LEGAL.contactEmail}.`,
    ],
  },
  {
    id: "collection",
    title: "3. Information We Collect",
    subsections: [
      {
        title: "Account and profile",
        list: [
          "Name, email address, profile photo, and authentication identifiers",
          "OAuth tokens and calendar connection metadata when you connect Google or Microsoft",
          "Workspace membership, roles, and invitation details",
        ],
      },
      {
        title: "Meeting and content data",
        list: [
          "Meeting titles, URLs, schedules, participants, and metadata from connected calendars",
          "Audio recordings, transcripts, speaker labels, notes, summaries, action items, and embeddings generated from your meetings",
          "Files you upload and content you create, share, or comment on within workspaces",
        ],
      },
      {
        title: "Usage and technical data",
        list: [
          "Device type, browser, IP address, approximate location derived from IP, and log data",
          "Feature usage, performance metrics, and error reports (including via Sentry when enabled)",
          "Cookies and similar technologies used for authentication, security, and preferences",
        ],
      },
      {
        title: "Billing",
        list: [
          "Subscription plan, billing history, and payment method details processed by Stripe (we do not store full card numbers)",
        ],
      },
    ],
  },
  {
    id: "sources",
    title: "4. How We Collect Information",
    paragraphs: [
      "We collect information directly from you (e.g., when you register, connect integrations, or upload content), automatically when you use the Service, and from third parties such as OAuth providers, calendar APIs, video conferencing platforms, and payment processors.",
      "When you invite a meeting bot, we and our subprocessors may receive meeting audio, participant information, and transcripts from the conferencing platform and our bot provider.",
    ],
  },
  {
    id: "use",
    title: "5. How We Use Information",
    paragraphs: ["We use personal information to:"],
    list: [
      "Provide, operate, and maintain the Service, including transcription, search, and AI analysis",
      "Authenticate users, manage workspaces, and process invitations",
      "Connect calendars, schedule bots, and sync meeting-related data you authorize",
      "Process payments and manage subscriptions",
      "Send transactional emails (e.g., workspace invites, meeting share links, security notices)",
      "Monitor, debug, and improve performance, reliability, and security",
      "Comply with legal obligations and enforce our Terms of Service",
      "With your consent or as otherwise permitted by law, send product updates and marketing communications (you may opt out)",
    ],
  },
  {
    id: "ai-processing",
    title: "6. AI and Automated Processing",
    paragraphs: [
      "We use automated systems, including third-party AI models, to transcribe meetings, generate summaries, extract action items, perform semantic search, and produce other insights. Outputs may be inaccurate; do not rely on them as the sole basis for important decisions.",
      "Meeting content may be sent to AI subprocessors for processing. We configure providers to use data only to deliver services to us, subject to their terms and our agreements where applicable.",
    ],
  },
  {
    id: "sharing",
    title: "7. How We Share Information",
    paragraphs: [
      "We do not sell your personal information. We share information only as described below:",
    ],
    list: [
      "With workspace members and people you explicitly invite, according to sharing settings you choose",
      "With service providers that help us operate the Service (hosting, storage, email, analytics, payment processing, meeting bots, transcription, and AI)",
      "With integration partners you connect (e.g., Slack, Linear) when you enable those features",
      "With professional advisers, regulators, or law enforcement when required by law or to protect rights and safety",
      "In connection with a merger, acquisition, or sale of assets, subject to appropriate safeguards",
    ],
  },
  {
    id: "subprocessors",
    title: "8. Subprocessors",
    paragraphs: [
      "We use trusted subprocessors to deliver the Service. Categories and examples include:",
    ],
    list: [
      "Cloud infrastructure and object storage (e.g., AWS S3)",
      "Database and authentication (PostgreSQL, BetterAuth)",
      "Meeting bots and real-time conferencing integrations (Recall.ai)",
      "Speech-to-text and diarization (self-hosted Whisper, pyannote, or equivalent)",
      "AI analysis and embeddings (OpenAI)",
      "Email delivery (Resend)",
      "Payments (Stripe)",
      "Error monitoring (Sentry, when configured)",
    ],
    subsections: [
      {
        title: "International transfers",
        paragraphs: [
          "Subprocessors may process data in the United States and other countries. Where required, we rely on appropriate safeguards such as Standard Contractual Clauses or equivalent mechanisms.",
        ],
      },
    ],
  },
  {
    id: "retention",
    title: "9. Data Retention",
    paragraphs: [
      "We retain personal information for as long as your account is active or as needed to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements.",
      "Meeting recordings and transcripts are retained according to your workspace settings and plan limits until you delete them or close your account, after which we delete or anonymize data within a reasonable period unless retention is required by law.",
      "Backups may persist for a limited time before being overwritten.",
    ],
  },
  {
    id: "security",
    title: "10. Security",
    paragraphs: [
      "We implement technical and organizational measures designed to protect personal information, including encryption in transit, access controls, and monitoring. No method of transmission or storage is completely secure; we cannot guarantee absolute security.",
      "You are responsible for safeguarding your credentials and configuring workspace access appropriately.",
    ],
  },
  {
    id: "rights",
    title: "11. Your Rights and Choices",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, delete, restrict, or port your personal information, and to object to certain processing. You may also withdraw consent where processing is consent-based.",
      `To exercise rights, contact us at ${LEGAL.privacyEmail}. We may verify your identity before responding. You may also use in-product account and workspace settings to update profile information or delete content.`,
      "If you are in the EEA, UK, or Switzerland, you may lodge a complaint with your local supervisory authority. California residents may have additional rights under the CCPA/CPRA, including knowing, deleting, and opting out of certain sharing (we do not sell personal information as defined by the CPRA).",
    ],
  },
  {
    id: "cookies",
    title: "12. Cookies",
    paragraphs: [
      "We use essential cookies for authentication and security. We may use analytics cookies to understand how the Service is used. You can control non-essential cookies through your browser settings; disabling essential cookies may affect functionality.",
    ],
  },
  {
    id: "children",
    title: "13. Children's Privacy",
    paragraphs: [
      "The Service is not directed to children under 16. We do not knowingly collect personal information from children. Contact us if you believe we have collected such information and we will delete it.",
    ],
  },
  {
    id: "changes",
    title: "14. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will post the revised policy with an updated effective date and provide additional notice for material changes where required by law.",
    ],
  },
  {
    id: "contact",
    title: "15. Contact Us",
    paragraphs: [
      `Privacy questions or requests: ${LEGAL.privacyEmail}.`,
      `General legal inquiries: ${LEGAL.contactEmail}.`,
    ],
  },
]
