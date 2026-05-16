import type { LegalSection } from "../_lib/legal"
import { LEGAL } from "../_lib/legal"

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "1. Agreement to Terms",
    paragraphs: [
      `These Terms of Service ("Terms") govern your access to and use of ${LEGAL.productName}, including our website, applications, APIs, and related services (collectively, the "Service"), operated by ${LEGAL.companyName} ("we", "us", or "our").`,
      `By creating an account, accessing, or using the Service, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Service.`,
      `If you use the Service on behalf of an organization, you represent that you have authority to bind that organization, and "you" refers to both you and the organization.`,
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    paragraphs: [
      "You must be at least 16 years old (or the minimum age required in your jurisdiction) to use the Service. By using the Service, you represent that you meet this requirement and that the information you provide is accurate and complete.",
    ],
  },
  {
    id: "account",
    title: "3. Accounts and Security",
    paragraphs: [
      `You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us promptly at ${LEGAL.contactEmail} if you suspect unauthorized access.`,
      "We may suspend or terminate accounts that violate these Terms, pose security risks, or remain inactive for an extended period, subject to applicable law.",
    ],
  },
  {
    id: "service",
    title: "4. The Service",
    paragraphs: [
      `${LEGAL.productName} is a meeting intelligence platform that helps teams record, transcribe, search, and analyze meetings. Features may include calendar integrations, automated meeting bots, transcription, AI-generated summaries and action items, workspace collaboration, file uploads, and third-party integrations.`,
      "We may add, change, or discontinue features at any time. We strive for high availability but do not guarantee uninterrupted or error-free operation.",
    ],
  },
  {
    id: "meeting-consent",
    title: "5. Meeting Recording and Consent",
    paragraphs: [
      "You are solely responsible for complying with laws that apply to recording meetings, including obtaining required consent from participants before a bot joins or a meeting is recorded. Laws vary by jurisdiction and platform (e.g., Zoom, Google Meet, Microsoft Teams).",
      "By dispatching a meeting bot or enabling recording features, you represent that you have all necessary rights and consents. We are not responsible for your failure to obtain consent or for how you use recordings, transcripts, or AI outputs.",
    ],
  },
  {
    id: "acceptable-use",
    title: "6. Acceptable Use",
    paragraphs: ["You agree not to:"],
    list: [
      "Use the Service for unlawful, harassing, defamatory, or fraudulent purposes",
      "Record or process meetings without required participant consent",
      "Upload malware, attempt unauthorized access, or interfere with the Service",
      "Reverse engineer, scrape, or abuse rate limits except as permitted by law",
      "Resell or sublicense the Service without our written permission",
      "Use the Service to build a competing product using non-public aspects of the Service",
      "Submit content that infringes intellectual property or privacy rights of others",
    ],
  },
  {
    id: "content",
    title: "7. Your Content and License",
    paragraphs: [
      `"Your Content" means meeting recordings, transcripts, notes, uploads, and other materials you submit or generate through the Service. You retain ownership of Your Content.`,
      `You grant us a worldwide, non-exclusive license to host, process, transmit, and display Your Content solely to provide, maintain, secure, and improve the Service, including using subprocessors such as cloud storage and AI providers described in our Privacy Policy.`,
      "You represent that you have all rights necessary to grant this license and that Your Content does not violate these Terms or applicable law.",
    ],
  },
  {
    id: "ai",
    title: "8. AI-Generated Output",
    paragraphs: [
      "Summaries, action items, sentiment analysis, and other AI-generated outputs may be inaccurate or incomplete. They are provided for informational purposes only and are not professional, legal, or medical advice.",
      "You are responsible for reviewing AI output before relying on it. Do not use the Service as the sole basis for decisions with legal, financial, or safety implications.",
    ],
  },
  {
    id: "billing",
    title: "9. Subscriptions and Billing",
    paragraphs: [
      "Paid plans, usage limits, and pricing are described at checkout or on our pricing page. Subscriptions renew automatically unless canceled before the renewal date.",
      "Payments are processed by Stripe or another payment processor. You authorize us and our processor to charge your payment method for applicable fees, taxes, and overages.",
      "Except where required by law, fees are non-refundable. We may change pricing with reasonable notice; continued use after the effective date constitutes acceptance.",
    ],
  },
  {
    id: "third-party",
    title: "10. Third-Party Services",
    paragraphs: [
      "The Service integrates with third parties (e.g., video conferencing platforms, calendar providers, Recall.ai, OpenAI, Slack, Linear). Your use of those services is subject to their terms and policies. We are not responsible for third-party services.",
    ],
  },
  {
    id: "ip",
    title: "11. Our Intellectual Property",
    paragraphs: [
      `The Service, including software, design, and branding, is owned by ${LEGAL.companyName} and its licensors and is protected by intellectual property laws. Except for the limited rights expressly granted in these Terms, no rights are transferred to you.`,
    ],
  },
  {
    id: "termination",
    title: "12. Termination",
    paragraphs: [
      "You may stop using the Service and delete your account at any time through account settings or by contacting us.",
      "We may suspend or terminate access if you materially breach these Terms, if required by law, or to protect the Service or other users. Upon termination, your right to use the Service ends; sections that by nature should survive will survive (including limitations of liability and dispute terms).",
    ],
  },
  {
    id: "disclaimers",
    title: "13. Disclaimers",
    paragraphs: [
      `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
      "We do not warrant that the Service will be uninterrupted, secure, or free of errors, or that AI outputs will be accurate.",
    ],
  },
  {
    id: "liability",
    title: "14. Limitation of Liability",
    paragraphs: [
      `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${LEGAL.companyName.toUpperCase()} AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.`,
      "Our total liability for any claim arising out of these Terms or the Service is limited to the greater of (a) amounts you paid us in the twelve months before the claim or (b) one hundred U.S. dollars (USD $100).",
      "Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the fullest extent permitted by law.",
    ],
  },
  {
    id: "indemnity",
    title: "15. Indemnification",
    paragraphs: [
      "You will defend, indemnify, and hold harmless us and our affiliates from claims, damages, and expenses (including reasonable attorneys' fees) arising from Your Content, your use of the Service, violation of these Terms, or failure to obtain required recording consent.",
    ],
  },
  {
    id: "disputes",
    title: "16. Governing Law and Disputes",
    paragraphs: [
      `These Terms are governed by ${LEGAL.governingLaw}, without regard to conflict-of-law principles.`,
      `Before filing a claim, you agree to contact us at ${LEGAL.contactEmail} and attempt to resolve the dispute informally for at least 30 days.`,
      "Except where prohibited, disputes will be resolved by binding arbitration on an individual basis. You waive any right to participate in a class action. Either party may seek injunctive relief in court for intellectual property or unauthorized use.",
    ],
  },
  {
    id: "changes",
    title: "17. Changes to These Terms",
    paragraphs: [
      "We may update these Terms from time to time. We will post the revised version with an updated effective date and, for material changes, provide additional notice (e.g., email or in-product notice).",
      "Continued use after the effective date constitutes acceptance. If you do not agree, you must stop using the Service.",
    ],
  },
  {
    id: "contact",
    title: "18. Contact",
    paragraphs: [
      `Questions about these Terms: ${LEGAL.contactEmail}.`,
    ],
  },
]
